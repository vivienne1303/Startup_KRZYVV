(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // node_modules/@capacitor/core/dist/index.js
  var ExceptionCode, CapacitorException, getPlatformId, createCapacitor, initCapacitorGlobal, Capacitor, registerPlugin, WebPlugin, encode, decode, CapacitorCookiesPluginWeb, CapacitorCookies, readBlobAsBase64, normalizeHttpHeaders, buildUrlParams, buildRequestInit, CapacitorHttpPluginWeb, CapacitorHttp, SystemBarsStyle, SystemBarType, SystemBarsPluginWeb, SystemBars;
  var init_dist = __esm({
    "node_modules/@capacitor/core/dist/index.js"() {
      (function(ExceptionCode2) {
        ExceptionCode2["Unimplemented"] = "UNIMPLEMENTED";
        ExceptionCode2["Unavailable"] = "UNAVAILABLE";
      })(ExceptionCode || (ExceptionCode = {}));
      CapacitorException = class extends Error {
        constructor(message, code, data) {
          super(message);
          this.message = message;
          this.code = code;
          this.data = data;
        }
      };
      getPlatformId = (win) => {
        var _a, _b;
        if (win === null || win === void 0 ? void 0 : win.androidBridge) {
          return "android";
        } else if ((_b = (_a = win === null || win === void 0 ? void 0 : win.webkit) === null || _a === void 0 ? void 0 : _a.messageHandlers) === null || _b === void 0 ? void 0 : _b.bridge) {
          return "ios";
        } else {
          return "web";
        }
      };
      createCapacitor = (win) => {
        const capCustomPlatform = win.CapacitorCustomPlatform || null;
        const cap = win.Capacitor || {};
        const Plugins = cap.Plugins = cap.Plugins || {};
        const getPlatform = () => {
          return capCustomPlatform !== null ? capCustomPlatform.name : getPlatformId(win);
        };
        const isNativePlatform = () => getPlatform() !== "web";
        const isPluginAvailable = (pluginName) => {
          const plugin = registeredPlugins.get(pluginName);
          if (plugin === null || plugin === void 0 ? void 0 : plugin.platforms.has(getPlatform())) {
            return true;
          }
          if (getPluginHeader(pluginName)) {
            return true;
          }
          return false;
        };
        const getPluginHeader = (pluginName) => {
          var _a;
          return (_a = cap.PluginHeaders) === null || _a === void 0 ? void 0 : _a.find((h) => h.name === pluginName);
        };
        const handleError = (err) => win.console.error(err);
        const registeredPlugins = /* @__PURE__ */ new Map();
        const registerPlugin2 = (pluginName, jsImplementations = {}) => {
          const registeredPlugin = registeredPlugins.get(pluginName);
          if (registeredPlugin) {
            console.warn(`Capacitor plugin "${pluginName}" already registered. Cannot register plugins twice.`);
            return registeredPlugin.proxy;
          }
          const platform = getPlatform();
          const pluginHeader = getPluginHeader(pluginName);
          let jsImplementation;
          const loadPluginImplementation = async () => {
            if (!jsImplementation && platform in jsImplementations) {
              jsImplementation = typeof jsImplementations[platform] === "function" ? jsImplementation = await jsImplementations[platform]() : jsImplementation = jsImplementations[platform];
            } else if (capCustomPlatform !== null && !jsImplementation && "web" in jsImplementations) {
              jsImplementation = typeof jsImplementations["web"] === "function" ? jsImplementation = await jsImplementations["web"]() : jsImplementation = jsImplementations["web"];
            }
            return jsImplementation;
          };
          const createPluginMethod = (impl, prop) => {
            var _a, _b;
            if (pluginHeader) {
              const methodHeader = pluginHeader === null || pluginHeader === void 0 ? void 0 : pluginHeader.methods.find((m) => prop === m.name);
              if (methodHeader) {
                if (methodHeader.rtype === "promise") {
                  return (options) => cap.nativePromise(pluginName, prop.toString(), options);
                } else {
                  return (options, callback) => cap.nativeCallback(pluginName, prop.toString(), options, callback);
                }
              } else if (impl) {
                return (_a = impl[prop]) === null || _a === void 0 ? void 0 : _a.bind(impl);
              }
            } else if (impl) {
              return (_b = impl[prop]) === null || _b === void 0 ? void 0 : _b.bind(impl);
            } else {
              throw new CapacitorException(`"${pluginName}" plugin is not implemented on ${platform}`, ExceptionCode.Unimplemented);
            }
          };
          const createPluginMethodWrapper = (prop) => {
            let remove;
            const wrapper = (...args) => {
              const p = loadPluginImplementation().then((impl) => {
                const fn = createPluginMethod(impl, prop);
                if (fn) {
                  const p2 = fn(...args);
                  remove = p2 === null || p2 === void 0 ? void 0 : p2.remove;
                  return p2;
                } else {
                  throw new CapacitorException(`"${pluginName}.${prop}()" is not implemented on ${platform}`, ExceptionCode.Unimplemented);
                }
              });
              if (prop === "addListener") {
                p.remove = async () => remove();
              }
              return p;
            };
            wrapper.toString = () => `${prop.toString()}() { [capacitor code] }`;
            Object.defineProperty(wrapper, "name", {
              value: prop,
              writable: false,
              configurable: false
            });
            return wrapper;
          };
          const addListener = createPluginMethodWrapper("addListener");
          const removeListener = createPluginMethodWrapper("removeListener");
          const addListenerNative = (eventName, callback) => {
            const call = addListener({ eventName }, callback);
            const remove = async () => {
              const callbackId = await call;
              removeListener({
                eventName,
                callbackId
              }, callback);
            };
            const p = new Promise((resolve) => call.then(() => resolve({ remove })));
            p.remove = async () => {
              console.warn(`Using addListener() without 'await' is deprecated.`);
              await remove();
            };
            return p;
          };
          const proxy = new Proxy({}, {
            get(_, prop) {
              switch (prop) {
                // https://github.com/facebook/react/issues/20030
                case "$$typeof":
                  return void 0;
                case "toJSON":
                  return () => ({});
                case "addListener":
                  return pluginHeader ? addListenerNative : addListener;
                case "removeListener":
                  return removeListener;
                default:
                  return createPluginMethodWrapper(prop);
              }
            }
          });
          Plugins[pluginName] = proxy;
          registeredPlugins.set(pluginName, {
            name: pluginName,
            proxy,
            platforms: /* @__PURE__ */ new Set([...Object.keys(jsImplementations), ...pluginHeader ? [platform] : []])
          });
          return proxy;
        };
        if (!cap.convertFileSrc) {
          cap.convertFileSrc = (filePath) => filePath;
        }
        cap.getPlatform = getPlatform;
        cap.handleError = handleError;
        cap.isNativePlatform = isNativePlatform;
        cap.isPluginAvailable = isPluginAvailable;
        cap.registerPlugin = registerPlugin2;
        cap.Exception = CapacitorException;
        cap.DEBUG = !!cap.DEBUG;
        cap.isLoggingEnabled = !!cap.isLoggingEnabled;
        return cap;
      };
      initCapacitorGlobal = (win) => win.Capacitor = createCapacitor(win);
      Capacitor = /* @__PURE__ */ initCapacitorGlobal(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
      registerPlugin = Capacitor.registerPlugin;
      WebPlugin = class {
        constructor() {
          this.listeners = {};
          this.retainedEventArguments = {};
          this.windowListeners = {};
        }
        addListener(eventName, listenerFunc) {
          let firstListener = false;
          const listeners = this.listeners[eventName];
          if (!listeners) {
            this.listeners[eventName] = [];
            firstListener = true;
          }
          this.listeners[eventName].push(listenerFunc);
          const windowListener = this.windowListeners[eventName];
          if (windowListener && !windowListener.registered) {
            this.addWindowListener(windowListener);
          }
          if (firstListener) {
            this.sendRetainedArgumentsForEvent(eventName);
          }
          const remove = async () => this.removeListener(eventName, listenerFunc);
          const p = Promise.resolve({ remove });
          return p;
        }
        async removeAllListeners() {
          this.listeners = {};
          for (const listener in this.windowListeners) {
            this.removeWindowListener(this.windowListeners[listener]);
          }
          this.windowListeners = {};
        }
        notifyListeners(eventName, data, retainUntilConsumed) {
          const listeners = this.listeners[eventName];
          if (!listeners) {
            if (retainUntilConsumed) {
              let args = this.retainedEventArguments[eventName];
              if (!args) {
                args = [];
              }
              args.push(data);
              this.retainedEventArguments[eventName] = args;
            }
            return;
          }
          listeners.forEach((listener) => listener(data));
        }
        hasListeners(eventName) {
          var _a;
          return !!((_a = this.listeners[eventName]) === null || _a === void 0 ? void 0 : _a.length);
        }
        registerWindowListener(windowEventName, pluginEventName) {
          this.windowListeners[pluginEventName] = {
            registered: false,
            windowEventName,
            pluginEventName,
            handler: (event) => {
              this.notifyListeners(pluginEventName, event);
            }
          };
        }
        unimplemented(msg = "not implemented") {
          return new Capacitor.Exception(msg, ExceptionCode.Unimplemented);
        }
        unavailable(msg = "not available") {
          return new Capacitor.Exception(msg, ExceptionCode.Unavailable);
        }
        async removeListener(eventName, listenerFunc) {
          const listeners = this.listeners[eventName];
          if (!listeners) {
            return;
          }
          const index = listeners.indexOf(listenerFunc);
          if (index !== -1) {
            this.listeners[eventName].splice(index, 1);
          }
          if (!this.listeners[eventName].length) {
            this.removeWindowListener(this.windowListeners[eventName]);
          }
        }
        addWindowListener(handle) {
          window.addEventListener(handle.windowEventName, handle.handler);
          handle.registered = true;
        }
        removeWindowListener(handle) {
          if (!handle) {
            return;
          }
          window.removeEventListener(handle.windowEventName, handle.handler);
          handle.registered = false;
        }
        sendRetainedArgumentsForEvent(eventName) {
          const args = this.retainedEventArguments[eventName];
          if (!args) {
            return;
          }
          delete this.retainedEventArguments[eventName];
          args.forEach((arg) => {
            this.notifyListeners(eventName, arg);
          });
        }
      };
      encode = (str) => encodeURIComponent(str).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
      decode = (str) => str.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
      CapacitorCookiesPluginWeb = class extends WebPlugin {
        async getCookies() {
          const cookies = document.cookie;
          const cookieMap = {};
          cookies.split(";").forEach((cookie) => {
            if (cookie.length <= 0)
              return;
            let [key, value] = cookie.replace(/=/, "CAP_COOKIE").split("CAP_COOKIE");
            key = decode(key).trim();
            value = decode(value).trim();
            cookieMap[key] = value;
          });
          return cookieMap;
        }
        async setCookie(options) {
          try {
            const encodedKey = encode(options.key);
            const encodedValue = encode(options.value);
            const expires = options.expires ? `; expires=${options.expires.replace("expires=", "")}` : "";
            const path = (options.path || "/").replace("path=", "");
            const domain = options.url != null && options.url.length > 0 ? `domain=${options.url}` : "";
            document.cookie = `${encodedKey}=${encodedValue || ""}${expires}; path=${path}; ${domain};`;
          } catch (error) {
            return Promise.reject(error);
          }
        }
        async deleteCookie(options) {
          try {
            document.cookie = `${options.key}=; Max-Age=0`;
          } catch (error) {
            return Promise.reject(error);
          }
        }
        async clearCookies() {
          try {
            const cookies = document.cookie.split(";") || [];
            for (const cookie of cookies) {
              document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, `=;expires=${(/* @__PURE__ */ new Date()).toUTCString()};path=/`);
            }
          } catch (error) {
            return Promise.reject(error);
          }
        }
        async clearAllCookies() {
          try {
            await this.clearCookies();
          } catch (error) {
            return Promise.reject(error);
          }
        }
      };
      CapacitorCookies = registerPlugin("CapacitorCookies", {
        web: () => new CapacitorCookiesPluginWeb()
      });
      readBlobAsBase64 = async (blob) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result;
          resolve(base64String.indexOf(",") >= 0 ? base64String.split(",")[1] : base64String);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
      });
      normalizeHttpHeaders = (headers = {}) => {
        const originalKeys = Object.keys(headers);
        const loweredKeys = Object.keys(headers).map((k) => k.toLocaleLowerCase());
        const normalized = loweredKeys.reduce((acc, key, index) => {
          acc[key] = headers[originalKeys[index]];
          return acc;
        }, {});
        return normalized;
      };
      buildUrlParams = (params, shouldEncode = true) => {
        if (!params)
          return null;
        const output = Object.entries(params).reduce((accumulator, entry) => {
          const [key, value] = entry;
          let encodedValue;
          let item;
          if (Array.isArray(value)) {
            item = "";
            value.forEach((str) => {
              encodedValue = shouldEncode ? encodeURIComponent(str) : str;
              item += `${key}=${encodedValue}&`;
            });
            item.slice(0, -1);
          } else {
            encodedValue = shouldEncode ? encodeURIComponent(value) : value;
            item = `${key}=${encodedValue}`;
          }
          return `${accumulator}&${item}`;
        }, "");
        return output.substr(1);
      };
      buildRequestInit = (options, extra = {}) => {
        const output = Object.assign({ method: options.method || "GET", headers: options.headers }, extra);
        const headers = normalizeHttpHeaders(options.headers);
        const type = headers["content-type"] || "";
        if (typeof options.data === "string") {
          output.body = options.data;
        } else if (type.includes("application/x-www-form-urlencoded")) {
          const params = new URLSearchParams();
          for (const [key, value] of Object.entries(options.data || {})) {
            params.set(key, value);
          }
          output.body = params.toString();
        } else if (type.includes("multipart/form-data") || options.data instanceof FormData) {
          const form = new FormData();
          if (options.data instanceof FormData) {
            options.data.forEach((value, key) => {
              form.append(key, value);
            });
          } else {
            for (const key of Object.keys(options.data)) {
              form.append(key, options.data[key]);
            }
          }
          output.body = form;
          const headers2 = new Headers(output.headers);
          headers2.delete("content-type");
          output.headers = headers2;
        } else if (type.includes("application/json") || typeof options.data === "object") {
          output.body = JSON.stringify(options.data);
        }
        return output;
      };
      CapacitorHttpPluginWeb = class extends WebPlugin {
        /**
         * Perform an Http request given a set of options
         * @param options Options to build the HTTP request
         */
        async request(options) {
          const requestInit = buildRequestInit(options, options.webFetchExtra);
          const urlParams = buildUrlParams(options.params, options.shouldEncodeUrlParams);
          const url = urlParams ? `${options.url}?${urlParams}` : options.url;
          const response = await fetch(url, requestInit);
          const contentType = response.headers.get("content-type") || "";
          let { responseType = "text" } = response.ok ? options : {};
          if (contentType.includes("application/json")) {
            responseType = "json";
          }
          let data;
          let blob;
          switch (responseType) {
            case "arraybuffer":
            case "blob":
              blob = await response.blob();
              data = await readBlobAsBase64(blob);
              break;
            case "json":
              data = await response.json();
              break;
            case "document":
            case "text":
            default:
              data = await response.text();
          }
          const headers = {};
          response.headers.forEach((value, key) => {
            headers[key] = value;
          });
          return {
            data,
            headers,
            status: response.status,
            url: response.url
          };
        }
        /**
         * Perform an Http GET request given a set of options
         * @param options Options to build the HTTP request
         */
        async get(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "GET" }));
        }
        /**
         * Perform an Http POST request given a set of options
         * @param options Options to build the HTTP request
         */
        async post(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "POST" }));
        }
        /**
         * Perform an Http PUT request given a set of options
         * @param options Options to build the HTTP request
         */
        async put(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "PUT" }));
        }
        /**
         * Perform an Http PATCH request given a set of options
         * @param options Options to build the HTTP request
         */
        async patch(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "PATCH" }));
        }
        /**
         * Perform an Http DELETE request given a set of options
         * @param options Options to build the HTTP request
         */
        async delete(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "DELETE" }));
        }
      };
      CapacitorHttp = registerPlugin("CapacitorHttp", {
        web: () => new CapacitorHttpPluginWeb()
      });
      (function(SystemBarsStyle2) {
        SystemBarsStyle2["Dark"] = "DARK";
        SystemBarsStyle2["Light"] = "LIGHT";
        SystemBarsStyle2["Default"] = "DEFAULT";
      })(SystemBarsStyle || (SystemBarsStyle = {}));
      (function(SystemBarType2) {
        SystemBarType2["StatusBar"] = "StatusBar";
        SystemBarType2["NavigationBar"] = "NavigationBar";
      })(SystemBarType || (SystemBarType = {}));
      SystemBarsPluginWeb = class extends WebPlugin {
        async setStyle() {
          this.unavailable("not available for web");
        }
        async setAnimation() {
          this.unavailable("not available for web");
        }
        async show() {
          this.unavailable("not available for web");
        }
        async hide() {
          this.unavailable("not available for web");
        }
      };
      SystemBars = registerPlugin("SystemBars", {
        web: () => new SystemBarsPluginWeb()
      });
    }
  });

  // node_modules/@capacitor/app/dist/esm/web.js
  var web_exports = {};
  __export(web_exports, {
    AppWeb: () => AppWeb
  });
  var AppWeb;
  var init_web = __esm({
    "node_modules/@capacitor/app/dist/esm/web.js"() {
      init_dist();
      AppWeb = class extends WebPlugin {
        constructor() {
          super();
          this.handleVisibilityChange = () => {
            const data = {
              isActive: document.hidden !== true
            };
            this.notifyListeners("appStateChange", data);
            if (document.hidden) {
              this.notifyListeners("pause", null);
            } else {
              this.notifyListeners("resume", null);
            }
          };
          document.addEventListener("visibilitychange", this.handleVisibilityChange, false);
        }
        exitApp() {
          throw this.unimplemented("Not implemented on web.");
        }
        async getInfo() {
          throw this.unimplemented("Not implemented on web.");
        }
        async getLaunchUrl() {
          return { url: "" };
        }
        async getState() {
          return { isActive: document.hidden !== true };
        }
        async minimizeApp() {
          throw this.unimplemented("Not implemented on web.");
        }
        async toggleBackButtonHandler() {
          throw this.unimplemented("Not implemented on web.");
        }
        async getAppLanguage() {
          return {
            value: navigator.language.split("-")[0].toLowerCase()
          };
        }
      };
    }
  });

  // node_modules/@capacitor/browser/dist/esm/web.js
  var web_exports2 = {};
  __export(web_exports2, {
    Browser: () => Browser,
    BrowserWeb: () => BrowserWeb
  });
  var BrowserWeb, Browser;
  var init_web2 = __esm({
    "node_modules/@capacitor/browser/dist/esm/web.js"() {
      init_dist();
      BrowserWeb = class extends WebPlugin {
        constructor() {
          super();
          this._lastWindow = null;
        }
        async open(options) {
          this._lastWindow = window.open(options.url, options.windowName || "_blank");
        }
        async close() {
          return new Promise((resolve, reject) => {
            if (this._lastWindow != null) {
              this._lastWindow.close();
              this._lastWindow = null;
              resolve();
            } else {
              reject("No active window to close!");
            }
          });
        }
      };
      Browser = new BrowserWeb();
    }
  });

  // src/native.js
  init_dist();

  // node_modules/@capacitor/app/dist/esm/index.js
  init_dist();
  var App = registerPlugin("App", {
    web: () => Promise.resolve().then(() => (init_web(), web_exports)).then((m) => new m.AppWeb())
  });

  // node_modules/@capacitor/browser/dist/esm/index.js
  init_dist();
  var Browser2 = registerPlugin("Browser", {
    web: () => Promise.resolve().then(() => (init_web2(), web_exports2)).then((m) => new m.BrowserWeb())
  });

  // node_modules/@capacitor/clipboard/dist/esm/index.js
  init_dist();

  // node_modules/@capacitor/clipboard/dist/esm/web.js
  init_dist();
  var ClipboardWeb = class extends WebPlugin {
    async write(options) {
      if (typeof navigator === "undefined" || !navigator.clipboard) {
        throw this.unavailable("Clipboard API not available in this browser");
      }
      if (options.string !== void 0) {
        await this.writeText(options.string);
      } else if (options.url) {
        await this.writeText(options.url);
      } else if (options.image) {
        if (typeof ClipboardItem !== "undefined") {
          try {
            const blob = await (await fetch(options.image)).blob();
            const clipboardItemInput = new ClipboardItem({ [blob.type]: blob });
            await navigator.clipboard.write([clipboardItemInput]);
          } catch (err) {
            throw new Error("Failed to write image");
          }
        } else {
          throw this.unavailable("Writing images to the clipboard is not supported in this browser");
        }
      } else {
        throw new Error("Nothing to write");
      }
    }
    async read() {
      if (typeof navigator === "undefined" || !navigator.clipboard) {
        throw this.unavailable("Clipboard API not available in this browser");
      }
      if (typeof ClipboardItem !== "undefined") {
        try {
          const clipboardItems = await navigator.clipboard.read();
          const type = clipboardItems[0].types[0];
          const clipboardBlob = await clipboardItems[0].getType(type);
          const data = await this._getBlobData(clipboardBlob, type);
          return { value: data, type };
        } catch (err) {
          return this.readText();
        }
      } else {
        return this.readText();
      }
    }
    async readText() {
      if (typeof navigator === "undefined" || !navigator.clipboard || !navigator.clipboard.readText) {
        throw this.unavailable("Reading from clipboard not supported in this browser");
      }
      const text = await navigator.clipboard.readText();
      return { value: text, type: "text/plain" };
    }
    async writeText(text) {
      if (typeof navigator === "undefined" || !navigator.clipboard || !navigator.clipboard.writeText) {
        throw this.unavailable("Writting to clipboard not supported in this browser");
      }
      await navigator.clipboard.writeText(text);
    }
    _getBlobData(clipboardBlob, type) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        if (type.includes("image")) {
          reader.readAsDataURL(clipboardBlob);
        } else {
          reader.readAsText(clipboardBlob);
        }
        reader.onloadend = () => {
          const r = reader.result;
          resolve(r);
        };
        reader.onerror = (e) => {
          reject(e);
        };
      });
    }
  };

  // node_modules/@capacitor/clipboard/dist/esm/index.js
  var Clipboard = registerPlugin("Clipboard", {
    web: () => new ClipboardWeb()
  });

  // node_modules/@capacitor/keyboard/dist/esm/index.js
  init_dist();

  // node_modules/@capacitor/keyboard/dist/esm/definitions.js
  var KeyboardStyle;
  (function(KeyboardStyle2) {
    KeyboardStyle2["Dark"] = "DARK";
    KeyboardStyle2["Light"] = "LIGHT";
    KeyboardStyle2["Default"] = "DEFAULT";
  })(KeyboardStyle || (KeyboardStyle = {}));
  var KeyboardResize;
  (function(KeyboardResize2) {
    KeyboardResize2["Body"] = "body";
    KeyboardResize2["Ionic"] = "ionic";
    KeyboardResize2["Native"] = "native";
    KeyboardResize2["None"] = "none";
  })(KeyboardResize || (KeyboardResize = {}));

  // node_modules/@capacitor/keyboard/dist/esm/index.js
  var Keyboard = registerPlugin("Keyboard");

  // src/session.js
  function installSession(window2) {
    const storage = window2.localStorage;
    const api = "https://teenlaunch-production.up.railway.app/api";
    const originalFetch = window2.fetch.bind(window2);
    const keys = ["teenlaunch_token", "teenlaunch_refresh_token", "teenlaunch_user", "teenlaunch_profile"];
    let refreshing = null;
    let generation = 0;
    function clearSession() {
      generation++;
      keys.forEach((key) => storage.removeItem(key));
    }
    function saveSession(data) {
      const token = data.token || data.access_token || data.session?.access_token;
      const refresh = data.refreshToken || data.refresh_token || data.session?.refresh_token;
      if (!token) throw new Error("Login succeeded, but no access token was returned.");
      generation++;
      storage.setItem(keys[0], token);
      if (refresh) storage.setItem(keys[1], refresh);
      else storage.removeItem(keys[1]);
      if (data.user) storage.setItem(keys[2], JSON.stringify(data.user));
      if (data.profile) storage.setItem(keys[3], JSON.stringify(data.profile));
    }
    function expiresSoon(token) {
      try {
        const part = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(window2.atob(part));
        return !payload.exp || payload.exp * 1e3 < Date.now() + 6e4;
      } catch {
        return true;
      }
    }
    async function refreshSession() {
      if (refreshing) return refreshing;
      const refreshToken = storage.getItem(keys[1]);
      if (!refreshToken) return null;
      const currentGeneration = generation;
      refreshing = (async () => {
        const response = await originalFetch(api + "/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
          signal: AbortSignal.timeout(15e3)
        });
        if (!response.ok) {
          if (currentGeneration === generation && [400, 401].includes(response.status)) clearSession();
          throw new Error(response.status === 404 ? "Session renewal is not available on the server yet. Please log in again." : "Your session could not be renewed. Please reconnect or log in again.");
        }
        const data = await response.json();
        if (currentGeneration !== generation) return null;
        if (!data.token || !data.refreshToken) throw new Error("Invalid session renewal response.");
        saveSession(data);
        return data.token;
      })().finally(() => {
        refreshing = null;
      });
      return refreshing;
    }
    window2.fetch = async (input, init) => {
      const request = new Request(input, init);
      const url = new URL(request.url, window2.location.href);
      const isApi = url.origin === new URL(api).origin && url.pathname.startsWith("/api/");
      if (!isApi) return originalFetch(input, init);
      const isLogout = url.pathname === "/api/auth/logout";
      const authenticated = /^Bearer /i.test(request.headers.get("Authorization") || "");
      if (!authenticated) return originalFetch(request);
      try {
        let token = storage.getItem(keys[0]);
        if (!isLogout && token && expiresSoon(token) && storage.getItem(keys[1])) {
          token = await refreshSession();
        }
        const send = () => {
          const headers = new Headers(request.headers);
          const latest = storage.getItem(keys[0]);
          if (latest) headers.set("Authorization", "Bearer " + latest);
          else headers.delete("Authorization");
          return originalFetch(new Request(request.clone(), { headers }));
        };
        const response = await send();
        if (!isLogout && response.status === 401 && storage.getItem(keys[1])) {
          await refreshSession();
          return send();
        }
        return response;
      } finally {
        if (isLogout) clearSession();
      }
    };
    async function refreshIfNeeded() {
      const token = storage.getItem(keys[0]);
      if (token && expiresSoon(token) && storage.getItem(keys[1])) return refreshSession();
      return token;
    }
    const session2 = { saveSession, clearSession, refreshSession, refreshIfNeeded };
    window2.TeenLaunchSession = session2;
    window2.addEventListener("online", () => refreshIfNeeded().catch(() => {
    }));
    window2.document.addEventListener("visibilitychange", () => {
      if (!window2.document.hidden) refreshIfNeeded().catch(() => {
      });
    });
    window2.setInterval(() => {
      if (!window2.document.hidden) refreshIfNeeded().catch(() => {
      });
    }, 6e4);
    return session2;
  }

  // src/native.js
  window.TEENLAUNCH_API_ORIGIN = "https://teenlaunch-production.up.railway.app";
  window.TEENLAUNCH_API_BASE = window.TEENLAUNCH_API_ORIGIN + "/api";
  var session = installSession(window);
  var native = Capacitor.isNativePlatform();
  var root = new URL("./", document.currentScript.src);
  var keyboardVisible = false;
  var report = (error) => console.warn("Mobile integration:", error.message);
  async function openExternal(value) {
    const url = new URL(value, location.href);
    if (!["https:", "http:", "mailto:", "tel:"].includes(url.protocol)) return;
    if (native && ["https:", "http:"].includes(url.protocol)) {
      await Browser2.open({ url: url.href });
    } else if (["mailto:", "tel:"].includes(url.protocol)) {
      location.href = url.href;
    } else {
      window.open(url.href, "_blank", "noopener,noreferrer");
    }
  }
  window.TeenLaunchNative = {
    openExternal,
    publicPortfolioUrl(slug) {
      return "https://www.teenlaunch.app/pages/public-portfolio.html?slug=" + encodeURIComponent(slug);
    },
    async copyText(text) {
      if (native) return Clipboard.write({ string: String(text) });
      return navigator.clipboard.writeText(String(text));
    }
  };
  if (native) {
    document.documentElement.classList.add("native-app");
    const NativePrint = registerPlugin("TeenLaunchPrint");
    window.print = () => NativePrint.print().catch(report);
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.getRegistrations().then((items) => Promise.all(items.map((item) => item.unregister()))).catch(report);
    }
    document.addEventListener("click", (event) => {
      const anchor = event.target.closest?.("a[href]");
      if (!anchor || event.defaultPrevented) return;
      const url = new URL(anchor.href, location.href);
      if (url.origin === location.origin) return;
      if (!["https:", "http:", "mailto:", "tel:"].includes(url.protocol)) return;
      event.preventDefault();
      openExternal(url.href).catch(report);
    }, true);
    window.open = (value) => {
      if (!value) return null;
      const url = new URL(value, location.href);
      if (url.origin === location.origin) location.href = url.href;
      else openExternal(url.href).catch(report);
      return null;
    };
    App.addListener("resume", () => session.refreshIfNeeded().catch(report)).catch(report);
    App.addListener("backButton", async ({ canGoBack }) => {
      if (keyboardVisible) {
        await Keyboard.hide();
        return;
      }
      const dialog = document.querySelector("dialog[open]");
      if (dialog) {
        dialog.close();
        return;
      }
      const menu = document.querySelector(".nav-links.open");
      if (menu) {
        menu.classList.remove("open");
        document.querySelector(".nav-toggle")?.setAttribute("aria-expanded", "false");
        return;
      }
      if (canGoBack) {
        history.back();
        return;
      }
      if (location.pathname !== root.pathname + "index.html" && location.pathname !== root.pathname) {
        location.replace(new URL("index.html", root).href);
        return;
      }
      await App.minimizeApp();
    }).catch(report);
    Keyboard.addListener("keyboardDidShow", () => {
      keyboardVisible = true;
      document.documentElement.classList.add("keyboard-open");
      document.activeElement?.scrollIntoView({ block: "center", behavior: "smooth" });
    }).catch(report);
    Keyboard.addListener("keyboardDidHide", () => {
      keyboardVisible = false;
      document.documentElement.classList.remove("keyboard-open");
    }).catch(report);
  }
})();
/*! Bundled license information:

@capacitor/core/dist/index.js:
  (*! Capacitor: https://capacitorjs.com/ - MIT License *)
*/
