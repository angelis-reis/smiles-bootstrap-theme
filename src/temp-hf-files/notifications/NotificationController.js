var smls = window.smls || {};
smls.hf = smls.hf || {};

(function (ns) {

  ns.aws = ns.aws || {};
  ns.aws.CredentialsController = {
    jsonAwsCredentials: null,

    init: function (identityIdAws, tokenAws, callback) {
      if (this.jsonAwsCredentials) {
        var diff = this.jsonAwsCredentials.date - new Date().getTime();
        var horas = Math.floor(diff / 3600000);
        if (horas === 1 || tokenAws) {
          this.getCredentials(identityIdAws, tokenAws, callback);
        } else {
          callback();
        }
      } else {
        this.getCredentials(identityIdAws, tokenAws, callback);
      }
    },

    getCredentials: function (identityIdAws, tokenAws, callback) {
      var self = this;

      // Set the region where your identity pool exists (us-east-1, eu-west-1)
      // eslint-disable-next-line no-undef
      AWS.config.region = 'us-east-1';
      var params = {
        IdentityId: identityIdAws,
      };
      if (tokenAws) {
        params.Logins = {
          'cognito-identity.amazonaws.com': tokenAws,
        };
      }

      // Configure the credentials provider to use your identity pool
      // eslint-disable-next-line no-undef
      AWS.config.credentials = new AWS.CognitoIdentityCredentials(params);

      // eslint-disable-next-line no-undef
      var cognitoidentity = new AWS.CognitoIdentity();
      cognitoidentity.getCredentialsForIdentity(params, function (err, data) {
        if (err) {
          console.log(err, err.stack);
        } else {
          self.jsonAwsCredentials = {
            accessKeyId: data.Credentials.AccessKeyId,
            secretAccessKey: data.Credentials.SecretKey,
            sessionToken: data.Credentials.SessionToken,
            date: new Date().getTime(),
          };
          if (typeof callback === 'function') callback();
        }
      });
    },
  };

  ns.util = ns.util || {};
  ns.util.GraphQLClient = {
    instance: null,

    getInstance: function () {
      if (!this.instance) {
        throw new Error('AWS Amplify Client not configured yet.');
      }
      return this.instance;
    },

    //User needs valid credentials before configuring Graphql client
    configure: function (endpoint, credentials) {
      this.instance = this.customAWSAmplifyClient(endpoint, credentials);
    },

    customAWSAmplifyClient: function (endpoint, credentials) {
      var Amplify = window['aws-amplify'].default;
      var appSyncConfig = {
        aws_appsync_graphqlEndpoint: endpoint,
        aws_appsync_region: 'us-east-1',
        aws_appsync_authenticationType: 'AWS_IAM',
        credentials: credentials,
      };

      var client = {
        client: Amplify.configure(appSyncConfig),

        query: function (query, variables) {
          var API = window['aws-amplify'].API;
          var graphqlOperation = window['aws-amplify'].graphqlOperation;
          query = graphqlOperation(query, variables);
          return API.graphql(query);
        },

        subscribe: function (subscriptionQuery, variables) {
          var API = window['aws-amplify'].API;
          var graphqlOperation = window['aws-amplify'].graphqlOperation;
          var subscription = graphqlOperation(subscriptionQuery, variables);
          return API.graphql(subscription);
        },

        mutate: function (mutationQuery, variables) {
          var API = window['aws-amplify'].API;
          var graphqlOperation = window['aws-amplify'].graphqlOperation;
          var mutation = graphqlOperation(mutationQuery, variables);
          return API.graphql(mutation);
        },
      };

      return client;
    },
  };

  ns.notification = ns.notification || {};
  ns.notification.Controller = {
    start: function (notificationConfig) {
      this.initGraphQL(notificationConfig).then(() => {
        try {
          ns.notification.CountController.init(
            ns.util.GraphQLClient.getInstance(),
            notificationConfig.memberNumber,
            notificationConfig.notificationCallback
          );
        } catch (e) {
          console.log('Erro ao inicializar central de notificações');
          console.log(e);
        }
      });
    },

    initGraphQL: function (notificationConfig) {
      return new Promise((resolve, reject) => {
        const awsCredentials = ns.aws.CredentialsController;
        awsCredentials.init(notificationConfig.identityIdAws, notificationConfig.tokenAws, () => {
          try {
            if (awsCredentials.jsonAwsCredentials) {
              ns.util.GraphQLClient.configure(
                notificationConfig.appsyncEndpoint,
                awsCredentials.jsonAwsCredentials,
              );
              resolve(ns.util.GraphQLClient.instance);
            }
          } catch (e) {
            console.log('Error configuring the GraphQLClient');
            console.log(e);
            reject(e);
          }
        });
      });
    },

    getGraphQL: function () {
      const self = this;
      return new Promise((resolve) => {
        if (ns.util.GraphQLClient) {
          resolve(ns.util.GraphQLClient.instance);
        } else {
          window.setTimeout(() => {
            self.getGraphQL().then((graphql) => resolve(graphql));
          }, 1000);
        }
      });
    },
  };

  ns.notification.CountController = {
    _model: 0,
    _callback: function (quantity) {
      console.log('Notifications: ' + quantity);
    },
    _subscriptions: [],
    _processedMessages: [],
    _memberNumber: null,
    _gqlClient: null,

    init: function (graphqlClient, memberNumber, callback) {
      console.info('starting notification controllers', graphqlClient);
      this._memberNumber = memberNumber;
      this._gqlClient = graphqlClient;
      if (typeof callback === 'function') {
        this._callback = callback;
      }

      this._callNotificationsCount();
      this._subscribeToNotificationUpdateCount();

      var self = this;
      window.addEventListener('unload', function () {
        self._subscriptions.forEach(function (subscription) {
          subscription.unsubscribe();
        });
      });
    },

    _callNotificationsCount: function () {
      var self = this;
      var query =
        'query GetNotificationNewCount($memberNumber:String!){getNotificationNewCount(memberNumber:$memberNumber){count}}';
      var variables = { memberNumber: self._memberNumber };
      self._gqlClient
        .query(query, variables)
        .then(function (result) {
          self._model = result.data.getNotificationNewCount.count;
          self._callback(self._model);
        })
        .catch(function (error) {
          console.log('error loading notifications centre');
          console.log(error);
        });
    },

    increase: function (quantity) {
      this._model += quantity || 1;
      this._callback(this._model);
    },

    decrease: function (quantity) {
      this._model -= quantity || 1;
      this._callback(this._model);
    },

    _subscribeToNotificationUpdateCount: function () {
      var self = this;
      var subscriptionQuery =
        'subscription NotificationUpdateCount($memberNumber:String!){notificationUpdateCount(memberNumber:$memberNumber){type notifications{id}}}';
      var variables = { memberNumber: self._memberNumber };
      var newSubscription = this._gqlClient
        .subscribe(subscriptionQuery, variables)
        .subscribe({
          next: function next(response) {
            var notificationUpdateCount =
              response.value.data.notificationUpdateCount;
            if (self._isMessageNotProcessed(notificationUpdateCount)) {
              if (notificationUpdateCount.type === 'NEW') {
                self.increase();
              } else if (notificationUpdateCount.type === 'HISTORY') {
                self.decrease(notificationUpdateCount.notifications.length);
              }
              self._setMessageAsProcessed(notificationUpdateCount);
            }
          },
        });
      self._subscriptions.push(newSubscription);
    },

    _isMessageNotProcessed: function (notificationUpdateCount) {
      return (
        this._processedMessages.indexOf(
          this._buildKey(notificationUpdateCount),
        ) < 0
      );
    },

    _setMessageAsProcessed: function (notificationUpdateCount) {
      this._processedMessages.push(this._buildKey(notificationUpdateCount));
    },

    _buildKey: function (notificationUpdateCount) {
      var key = notificationUpdateCount.type;
      notificationUpdateCount.notifications.forEach(function (notification) {
        key += notification.id;
      });
      return key;
    },

    loadFinish: function () {
      if (window['aws-amplify'] && window['aws-amplify'].default !== undefined) {
        ns.notification.Controller.start(ns.notification.Loader.notificationConfig);
      } else {
        window.setTimeout(() => this.loadFinish(), 2000);
      }
    },
  };
})(smls.hf);


// document.ready
if (
  document.readyState === "complete" ||
  (document.readyState !== "loading" && !document.documentElement.doScroll)
) {
  smls.hf.notification.CountController.loadFinish();
} else {
  var loadFinish = smls.hf.notification.CountController.loadFinish.bind(
    smls.hf.notification.CountController
  );
  document.addEventListener("DOMContentLoaded", loadFinish);
}
