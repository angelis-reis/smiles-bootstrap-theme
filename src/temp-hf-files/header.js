var smls = window.smls || {};
smls.hf = smls.hf || {};

(function (ns) {
  // eslint-disable-next-line strict
  "use strict";
  ns.version = "0.1.6";

  ns.Controller = {
    TOKEN_NAME: "session-token",
    PARAMS_TOKEN: "st",
    DATA_USER: "smls-user-data",
    USER_TEMPLATES: "smls-user-tpls",
    HOST: window.location.hostname,
    LOCATION: window.location,
    DEFAULT_ENV_SERVICE: "dev4",
    SERVICE_PARTNER_HML: "hml5",
    smlsHFEnv: null,
    isHmlPartner: false,
    isLocalhost: false,
    isPartnerDomain: false,
    portalName: null,
    staticDomain: "https://static.smiler.com.br",
    userLogged: false,
    smlsBody: null,
    smlsHeader: null,
    smlsBoxLogin: null,
    smlsBoxAccount: null,
    smlsDropdownContainer: null,
    smlsAvatarDropdownArrow: null,
    smlsMoreInfoContent: null,
    smlsMoreInfoArrow: null,
    smlsBlackout: null,
    smlsMoreInfo: null,
    smlsMoreInfoDesktopClose: null,
    smlsDrawer: null,
    smlsDrawerClose: null,
    smlsDrawerMoreInfoBack: null,
    smlsDrawerMoreInfoClose: null,
    smlsAvatar: null,
    smlsLogout: null,
    smlsAvatarDropdownContainer: null,
    smlsNotificationText: null,
    optChat: null,

    getElemId: function(objVar, domElem) {
      this[objVar] = window.document.getElementById(domElem);
    },

    initEnv: function (cb) {
      const self = this;
      self.getElemId("smlsBoxAccount", "smls-hf-account-user");
      self.getElemId("smlsHeader", "smls-hf-header-default");
      function getPrefix(prefix, change) {
        var index = self.HOST.indexOf(prefix);
        if (index !== -1) {
          var sufix = self.HOST.substring(index + 3, index + 4);
          return (change || prefix) + sufix;
        }
        return undefined;
      }
      function hasPartnerDomain() {
        var partners = [
          "www.shoppingsmiles.com.br",
          "hoteis.smiles.com.br",
          "carros.smiles.com.br",
          "ingresso.smiles.com.br",
          "atracoes.smiles.com.br",
          "passeios.smiles.com.br",
          "cruzeiros.smiles.com.br"
        ];
        return partners.indexOf(self.HOST) > -1;
      }
      function hasHmlPartnerDomain() {
        var partners = [
          "demo.gl-tours.com", 
          "hml.gopointsportal.com.br"
        ];
        return partners.indexOf(self.HOST) > -1;
      }
      var obj = {
        local: getPrefix("localhost"),
        hml: getPrefix("uat", "hml"),
        dev: getPrefix("dev"),
        get: function () {
          if (this.local) {
            const getCurrentEnv = window.localStorage.getItem("smlsHFEnv");
            self.isLocalhost = true;
            if (!getCurrentEnv) return self.DEFAULT_ENV_SERVICE;
            return getCurrentEnv.toLocaleLowerCase().replace("uat", "hml");
          }
          var current = this.hml || this.dev;
          if (current) return current;
          return "prd";
        },
      };
      self.isHmlPartner = hasHmlPartnerDomain();
      self.isPartnerDomain = hasPartnerDomain();
      self.smlsHFEnv =  self.isHmlPartner ? self.SERVICE_PARTNER_HML : obj.get();
      if(self.smlsHFEnv !== "prd") {
        var srcEnv  = self.isHmlPartner ? self.SERVICE_PARTNER_HML : self.smlsHFEnv;
        self.portalName = "portal-" + (srcEnv.indexOf("dev") > -1 ? srcEnv : srcEnv.replace("hml", "uat"));
        self.staticDomain = "https://" + self.portalName + "-static.smiler.com.br";
      }
      cb();
    },
    
    firstName: function(str) {
      return str.split(' ')[0];
    },

    formatNumer: function(str) {
      return String(str).replace(/(.)(?=(\d{3})+$)/g,'$1.');
    },

    getUserSession: function() {
      return JSON.parse(window.localStorage.getItem(this.DATA_USER));
    },

    getUserTemplate: function(node) {
      const templates = JSON.parse(window.localStorage.getItem(this.USER_TEMPLATES));
      return templates[node];
    },

    getMenuOption: function(id) {
      return document.querySelector("[data-smls-main-menu='" + id + "']");
    },

    clearSession: function(cb) {
      const self = this;
      window.localStorage.removeItem(self.TOKEN_NAME);
      window.localStorage.removeItem(self.DATA_USER);
      window.localStorage.removeItem(self.USER_TEMPLATES);
      // to be remove
      window.sessionStorage.removeItem(self.TOKEN_NAME);
      cb();
    },

    callLogin: function() {
      const self = this;
      if (typeof(window.smilesLogin) === "undefined") {
        var loginUrl = "https://www.smiles.com.br";
        var pathLogin = "/login";
        if ((self.LOCATION.pathname !== "/") && (self.LOCATION.pathname !== "/home")) {
          pathLogin += "?ref=" + window.location.href; 
        }
        if (self.smlsHFEnv !== 'prd') {
          loginUrl = "https://" + self.portalName + ".smiles.com.br" + pathLogin;
        }
        window.location.href = loginUrl;
      } else {
        if (typeof(window.smilesLogin) === "string") {
          window.location.href = window.smilesLogin;
        } else if (typeof(window.smilesLogin === "function")) {
          window.smilesLogin();
        }
      }
    },

    callLogout: function() {
      const self = this;
      self.clearSession(function() {
        if (typeof(window.smilesLogout) === "undefined") {
            self.smlsBody.style.position = "";
            window.location.href = "/logout";   
        } else {
          if (typeof(window.smilesLogout) === "string") {
            window.location.href = window.smilesLogout;
          } else if (typeof(window.smilesLogout === "function")) {
            window.smilesLogout();
          }
        }
      });
    },

    smlsMoreInfoToogle: function (closeAnyWay) {
      const self = this;
      if (self.smlsMoreInfoContent.className.indexOf("smls-hf-is-open") >= 0 && !closeAnyWay) return;
      if (closeAnyWay) {
        self.smlsMoreInfoContent.className = self.smlsMoreInfoContent.className.replace(
          "smls-hf-is-open",
          "",
        );
        self.smlsMoreInfoArrow.className = self.smlsMoreInfoArrow.className.replace(
          "smls-hf-rotate",
          "",
        );
        self.smlsBlackoutToogle(true);
      } else {
        self.smlsMoreInfoContent.className += " smls-hf-is-open";
        self.smlsMoreInfoArrow.className += " smls-hf-rotate";
        self.smlsBlackoutToogle();
      }
    },

    smlsBlackoutToogle: function (closeAnyWay) {
      const self = this;
      if (closeAnyWay || self.smlsBlackout.className.indexOf("smls-hf-blackout") >= 0) {
        self.smlsBlackout.className = "";
        self.smlsBody.style.overflowY = "auto";
        self.smlsBody.style.position = "initial";
        self.smlsBody.style.width = "initial";
      } else {
        self.smlsBlackout.className = "smls-hf-blackout";
        self.smlsBody.style.overflowY = "scroll";
        self.smlsBody.style.position = "fixed";
        self.smlsBody.style.width = "100%";
      }
    },

    smlsAvatarToogle: function (closeAnyWay) {
      const self = this;
      if (self.smlsDropdownContainer.className.indexOf("smls-hf-is-open") >= 0 && !closeAnyWay) return;
      if (closeAnyWay) {
        self.smlsAvatarDropdownArrow.className = self.smlsAvatarDropdownArrow.className.replace(
          "smls-hf-rotate",
          "",
        );
        self.smlsDropdownContainer.className = self.smlsDropdownContainer.className.replace(
          "smls-hf-is-open",
          "",
        );
        self.smlsDropdownContainer.style.zIndex = "auto";
        self.smlsBlackoutToogle(true);
      } else {
        self.smlsAvatarDropdownArrow.className += " smls-hf-rotate";
        self.smlsDropdownContainer.className += " smls-hf-is-open";
        self.smlsDropdownContainer.style.zIndex = "9999";
        self.smlsBlackoutToogle();
      }
    },

    smlsCloneElement: function () {
      var smlsAlredyExists = document.getElementById("smls-logo-smiles-clone");
      if (!smlsAlredyExists) {
        var smlsContainerToInsertClone = document.getElementsByClassName(
          "smls-hf-content-header",
        )[0];
        var smlsElement = document.getElementById("smls-logo-smiles");
        var smlsClone = smlsElement.cloneNode(true);
        smlsClone.id = "smls-logo-smiles-clone";
        smlsClone.ariaHidden = true;
        var smlsLastElement = smlsContainerToInsertClone.children[0];
        smlsContainerToInsertClone.insertBefore(smlsClone, smlsLastElement);
      }
    },

    smlsDrawerToogle: function (closeAnyWay, menu = "hamburger") {
      const self = this;
      if (
        closeAnyWay ||
        self.smlsHeader.className.indexOf("smls-hf-is-open") >= 0
      ) {
        self.smlsHeader.className = self.smlsHeader.className.replace(
          "smls-hf-is-open",
          "",
        );
        setTimeout(function () {
          self.smlsHeader.className = self.smlsHeader.className.replace(
            "hamburger",
            "",
          );
          self.smlsHeader.className = self.smlsHeader.className.replace(
            "profile",
            "",
          );
        }, 500);
        self.smlsBody.style.position = "";
      } else {
        self.smlsCloneElement();
        self.smlsHeader.className += " smls-hf-is-open " + menu;
        self.smlsBody.style.position = "fixed";
      }
    },

    checkUserToken: function(cb) {
      const self = this;
      function getQueryParam(params) {
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        for (var i = 0; i < vars.length; i++) {
          var pair = vars[i].split("=");
          if (decodeURIComponent(pair[0]) == params) {
            return decodeURIComponent(pair[1]);
          }
        }
      }
      function removeQueryParam(params) {
        // Verificar se precisa refatorar a funcao removeQueryParam
        var query = window.location.search.substring(1);
        var vars = query.split("&");
        var newQs = "";
        for (var i = 0; i < vars.length; i++) {
          var pair = vars[i].split("=");
          if (decodeURIComponent(pair[0]) !== params) {
            if (newQs!=="") newQs += "&";
            newQs += pair[0] + "=" + pair[1]
          }
        }
        if (newQs !== "") newQs = "?" + newQs;
        // Rever a Sintaxe pushState 
        window.history.pushState({}, document.title, window.location.pathname + newQs);
      }
      function isTokenValid(token) {
        var base64Url = token.split('.')[1];
        var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        var objToken = JSON.parse(jsonPayload);
        var currTime = Math.floor(new Date().getTime()/1000.0);
        return parseInt(objToken.exp) > parseInt(currTime);
      }
      var sessionToken = window.localStorage.getItem(self.TOKEN_NAME);
      if (sessionToken) {
        if (isTokenValid(sessionToken)) {
          self.userLogged = true;
        } else {
          self.clearSession(function() {
            self.userLogged = false;
          });
        }
      } else {
        var tokenParams = getQueryParam(self.PARAMS_TOKEN);
        if (tokenParams) {
          // Permite o envio do Token queryString somente para os parceiros
          removeQueryParam(self.PARAMS_TOKEN);
          if (isTokenValid(tokenParams)) {
            window.localStorage.setItem(self.TOKEN_NAME, tokenParams);
            self.userLogged = true;
          } else {
            self.userLogged = false;
            self.clearSession(function() {
              self.userLogged = false;
            });
          }
        }  
      }
      cb();
    },

    checkLinkDomain: function(str, type) {
      var wkStr = str;
      function checkPartnerLink(st, tp) {
        const partnerLink = [
          "https://www.shoppingsmiles.com.br/smiles/index.jsf",
          "https://carros.smiles.com.br/smiles_carros/carro_index.jsf",
          "https://atracoes.smiles.com.br/smiles_atracoes/index.jsf"
        ];
        const hmlLink = [
          "https://hml.gopointsportal.com.br/smiles/index.jsf",
          "https://hml.gopointsportal.com.br/smiles_carros/catalogo.jsf",
          "https://hml.gopointsportal.com.br/smiles_atracoes/index.jsf"
        ];
        if(tp === "link") {
          if (partnerLink.indexOf(st) > -1) {
            st = hmlLink[partnerLink.indexOf(st)];
          }
        } else {
          for (var i = 0; i < partnerLink.length; i++) {
            if (st.indexOf(partnerLink[i]) > -1) {
              st = st.replaceAll(partnerLink[i], hmlLink[i]);
            }
          }
        }
        return st
      }
      if (str.indexOf("www.smiles.com.br") > -1) {
        wkStr = str.replace("www.smiles.com.br", this.portalName + ".smiles.com.br");
      } else if (type === "link") {
        wkStr = checkPartnerLink(str, type);
      }
      if (type === "html") {
        wkStr = checkPartnerLink(wkStr, type);
      }
      return wkStr;
    },

    changeLinks: function() {
      const self = this;
      var hfIds = ["smls-hf-header-default", "smls-hf-footer-default"];
      for (var i = 0; i < hfIds.length; i++) {
        var elem = document.getElementById(hfIds[i]);
        if (elem) {
          var lkArray = elem.getElementsByTagName('a');
          for (var z = 0; z < lkArray.length; z++) {
            lkArray[z].setAttribute('href', self.checkLinkDomain(lkArray[z].href, 'link'));
          }
        }
      }
    },

    activePartnerMenu: function() {
      const self = this;
      const hotelDomains = ["hoteis.smiles.com.br", "smiles.staging.front-end.rocketmiles-qa.com"];
      const shoppingDomains = ["www.shoppingsmiles.com.br", "hml.gopointsportal.com.br", "shopping.smiles.com.br"];
      if(hotelDomains.indexOf(self.HOST) >-1 ) {
        self.getMenuOption("hoteis").classList.add("smls-hf-active");
      } else if (shoppingDomains.indexOf(self.HOST) >-1 ) {
        self.getMenuOption("shopping").classList.add("smls-hf-active");
      }
    },

    initCommonsElements: function () {
      const self = this;
      self.smlsBody = window.document.getElementsByTagName("body")[0];
      self.getElemId("smlsBoxLogin", "smls-hf-box-login");
      self.getElemId("smlsMoreInfoContent", "smls-hf-content-more"); 
      self.getElemId("smlsMoreInfoArrow", "smls-hf-routes-more"); 
      self.getElemId("smlsBlackout", "smls-hf-blackout"); 
      self.getElemId("smlsMoreInfo", "smls-hf-drop_plus"); 
      self.getElemId("smlsMoreInfoDesktopClose", "smls-hf-btn_close"); 
      self.getElemId("smlsDrawer", "smls-hf-header-drawer"); 
      self.getElemId("smlsDrawerClose", "smls-hf-header-drawer-close"); 
      self.getElemId("smlsDrawerMoreInfoBack", "smls-hf-more-back"); 
      self.getElemId("smlsDrawerMoreInfoClose", "smls-hf-more-close");
      self.getElemId("optChat", "smls-hf-opt_chat");

      self.smlsDrawer.addEventListener("click", function () {
        self.smlsDrawerToogle();
      });

      self.smlsDrawerClose.addEventListener("click", function () {
        self.smlsDrawerToogle(true);
      });

      self.smlsDrawerMoreInfoBack.addEventListener("click", function () {
        self.smlsMoreInfoToogle(true);
      });

      self.smlsDrawerMoreInfoClose.addEventListener("click", function () {
        self.smlsMoreInfoToogle(true);
        self.smlsDrawerToogle(true);
      });

      self.smlsMoreInfo.addEventListener("mouseenter", function () {
        if (window.innerWidth >= 1240){
          self.smlsMoreInfoToogle();
        }
      });

      self.smlsMoreInfo.addEventListener("click", function (e) {
        e.preventDefault();
        if (window.innerWidth < 1240){
          self.smlsMoreInfoToogle();
        }
      });

      self.smlsMoreInfo.addEventListener("mouseleave", function (e) {
        if (window.innerWidth >= 1240){
          var elemBounding = self.smlsMoreInfo.getBoundingClientRect();
          var mouseOutOfBottom = elemBounding.bottom - e.pageY;
          if (mouseOutOfBottom > 0){
            self.smlsMoreInfoToogle(true);
          }
        }
      });

      self.smlsMoreInfoDesktopClose.addEventListener("click", function () {
        self.smlsMoreInfoToogle(true);
      });

      self.smlsBlackout.addEventListener('mouseenter',function(){
        self.smlsMoreInfoToogle(true)
        if(self.userLogged) {
          self.smlsAvatarToogle(true);
        }
      });

      self.smlsMoreInfoContent.addEventListener("mouseleave", function () {
        if (window.innerWidth >= 1240){
          self.smlsMoreInfoToogle(true);
        }
      });

      self.smlsMoreInfoContent.addEventListener("scroll", function () {
        if (window.innerWidth < 1240) {
          var mobileMoreHeader = document.getElementsByClassName('smls-hf-content-more-header')[0];
          var position = self.smlsMoreInfoContent.scrollTop;
          if (position > 50) {
            mobileMoreHeader.style.boxShadow = "0px 0px 16px rgba(0, 0, 0, 0.12)";
          } else {
            mobileMoreHeader.style.boxShadow = "none";
          }
        }
      });

      if (self.optChat) {
        self.optChat.addEventListener('click', function (e) {
          if (typeof Smooch !== 'undefined') {
            e.preventDefault();
            Smooch.open();
          }
        });
      }
    },

    renderBoxLogin: function() {
      const self = this;
      self.smlsBoxLogin.innerHTML="<a class=\"smls-hf-btn-hyperlink-border smls-hf-profile\" href=\"javascript:smls.hf.Controller.callLogin()\" title=\"Entrar\" id=\"smls-hf-btn_toEnter\"> <i class=\"smls-hf-icon profile-black\"></i> Entrar </a>";
    },

    renderUserData: function() {
      const self = this;
      var userMenu = self.getUserTemplate("contentHtml");
      var userData = self.getUserSession();
      var mobileMenuActions = document.getElementsByClassName("smls-hf-actions")[0];
      var mobileAvatarIcon = document.createElement('div');
      mobileAvatarIcon.className = "smls-hf-avatar";
      mobileAvatarIcon.innerHTML = "<div class=\"smls-hf-avatar-container\" id=\"smls-hf-img_profile\"> <i class=\"smls-hf-icon profile-black\"></i></div>";
      mobileMenuActions.prepend(mobileAvatarIcon);
      userMenu = userMenu.replace("${user_name}", self.firstName(userData.firstName));
      userMenu = userMenu.replace("${user_miles}", self.formatNumer(userData.milesBalance));
      userMenu = userMenu.replace("${member_number}", userData.memberNumber);
      if (self.smlsHFEnv !== "prd") {
        userMenu = userMenu.replaceAll("www.smiles", self.portalName + ".smiles");
      }
      self.smlsBoxAccount.innerHTML=userMenu;
      self.getElemId("smlsDropdownContainer", "smls-hf-dropdown-container"); 
      self.getElemId("smlsAvatarDropdownArrow", "smls-hf-drop_profile");
      self.getElemId("smlsAvatar", "smls-hf-img_profile"); 
      self.getElemId("smlsLogout","smls-hf-btn_exit");
      self.getElemId("smlsAvatarDropdownContainer","smls-hf-avatar-dropdown");

      self.smlsBoxAccount.addEventListener("mouseenter", function (e) {
        self.smlsAvatarToogle();
        e.stopPropagation();
      });

      self.smlsBoxAccount.addEventListener("mouseleave", function (e) {
        var elemBounding = self.smlsAvatarDropdownContainer.getBoundingClientRect();
        var mouseOutOfBottom = elemBounding.bottom - e.pageY;
        if(mouseOutOfBottom > 0){
          self.smlsAvatarToogle(true);
          e.stopPropagation();
        }
      });

      self.smlsDropdownContainer.addEventListener("mouseenter", function (e) {
        self.smlsAvatarToogle();
        e.stopPropagation();
      });

      self.smlsLogout.addEventListener("click", function (e) {
        if( e.detail === 1) {
          self.callLogout();
        }
      });

      self.smlsAvatar.addEventListener("click", function () {
        self.smlsDrawerToogle(false, "profile");
      });

      self.customFooter(userData);
    },

    customFooter: function(userData) {
      const self = this;
      const elmId01 = "smls-dynamic-msg01";
      var elem = window.document.getElementById(elmId01);
      if (elem) {
        var dynMsg01 = self.getUserTemplate(elmId01);
        dynMsg01 = dynMsg01.replace("${user_name}", self.firstName(userData.firstName));
        if (self.smlsHFEnv !== "prd") {
          dynMsg01 = self.checkLinkDomain(dynMsg01, "html");
        }
        elem.innerHTML = dynMsg01;
      }
    },

    notificationCallback: function(count) {
      var self = this;
      self.getElemId("smlsNotificationText","smls-hf-opt_notifications");
      var smlsAvatarContainer = document.getElementsByClassName('smls-hf-avatar-container');
      var i = 0;
      if(Number(count) > 0){
        self.smlsAvatar.classList.add("has-notification"); 
        self.smlsNotificationText.innerText = "Notificações " + "(" + count + ")";
        for(i; i < smlsAvatarContainer.length; i++){
          smlsAvatarContainer[i].classList.add('has-notification')
        }
      }else{
        self.smlsNotificationText.innerText = "Notificações";
        for(i; i < smlsAvatarContainer.length; i++){
          smlsAvatarContainer[i].classList.remove('has-notification')
        }
      }
    },

    initNotifications: function() {
      if (typeof window.smlsNotificationConfig === 'object') {
        var member = this.getUserSession();
        if (member && member.memberNumber) {
          ns.notification.Loader.initNotificationsCounter(
            window.smlsNotificationConfig.identityIdAws,
            window.smlsNotificationConfig.tokenAws,
            window.smlsNotificationConfig.appsyncEndpoint,
            member.memberNumber,
            (count) => this.notificationCallback(count),
          );
        }
      }
    },

    loadUserData: function(cb) {
      // Carregamento em segundo plano
      // Deixar os dados no local storage

      const self = this;
      var token = window.localStorage.getItem(self.TOKEN_NAME);
      var url = 'https://members-' + self.smlsHFEnv + '.smiles.com.br/v1/members/info';
      fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token,
        }
      })
      .then(function(response) {
        if (!response.ok) {
          throw new Error('SmlsHF getMemberInfo error');
        }
        response.json().then(function(result) {
          window.localStorage.setItem(self.DATA_USER, JSON.stringify(result.data));
          cb(true);
        })

      })
      .catch(function() {
        cb(false);
      });
    },

    loadUserTemplates: function(cb) {
      // Ler em segundo plano caso os dados estejam no Session Storage e ataulizar a qtde de milhas
      const self = this;
      var baseUrl = self.staticDomain + "/hf"; 
      var url = baseUrl + "/smls-user-menu.json";

      fetch(url, {
        method: 'GET',
      })
      .then(function(response) {
        if (!response.ok) {
          throw new Error('Get User menu error');
        }
        response.json().then(function(result) {
          window.localStorage.setItem(self.USER_TEMPLATES, JSON.stringify(result));
          cb(true);
        })

      })
      .catch(function() {
        cb(false);
      });
    },

    initNotLogged: function () {
      const self = this;
      self.smlsHeader.classList.remove("smls-hf-logged");
      self.smlsBoxAccount.innerHTML="";
      self.clearSession(function(){
        self.renderBoxLogin();
      });
    },

    initLogged: function () {
      const self = this;
      self.smlsHeader.classList.add("smls-hf-logged");
      self.smlsBoxLogin.innerHTML="";
      self.loadUserData(function(isLoaded){
        if(isLoaded) {
          self.loadUserTemplates(function() {
            self.renderUserData();
            if ((!self.isPartnerDomain) && (!self.isHmlPartner)) {
              self.initNotifications();    
            }
          });
        }
      })
    },

    init: function () {
      const self = this;
      self.initCommonsElements();
      self.activePartnerMenu();
      self.initEnv(function () {
        if (self.smlsHFEnv !== "prd") self.changeLinks(); 
        self.checkUserToken(function(){
          if (self.userLogged) {
            self.initLogged();
          } else {
            self.initNotLogged();
          }
        });
      });
    },
  };

  ns.util = {
    Common: {
      loadScript: (srcUrl) => {
        var j = document.createElement('script');
        j.type = 'text/javascript';
        j.src = srcUrl;
        document.getElementsByTagName('head')[0].appendChild(j);
      },
    }
  };

  ns.notification = {
    Loader: {
      notificationConfig: null,

      initNotificationsCounter: function (identityIdAws, tokenAws, appsyncEndpoint, memberNumber, notificationCallback) {
        if (!identityIdAws || !appsyncEndpoint || !tokenAws || !memberNumber) {
          throw new Error('Invalid configuration.');
        }

        this.notificationConfig = {
          identityIdAws: identityIdAws,
          tokenAws: tokenAws,
          appsyncEndpoint: appsyncEndpoint,
          memberNumber: memberNumber,
          notificationCallback: notificationCallback
        };
        this.loadAllJs();
      },

      loadAllJs: function () {
        const jsUrl = ns.Controller.staticDomain + '/hf/notifications/';
        const jsFiles = [
          'lib/aws-amplify.js',
          'lib/browser-polyfill.min.js',
          'lib/graphql-tag.0.1.14.js',
          'lib/subscriptions-transport-ws.js',
          'NotificationController.js',
        ];

        jsFiles.forEach((file) => {
          ns.util.Common.loadScript(jsUrl + file);
        });
      },
    },
  };


})(smls.hf);

if (typeof(window.smlsSpa) === "undefined") {
  if (document.readyState === "complete") {
    smls.hf.Controller.init();
  } else {
    document.addEventListener("DOMContentLoaded", function(){
      smls.hf.Controller.init(); 
    });
  }
}

var smlsReloadHeader = function() {
  smls.hf.Controller.init();
}
