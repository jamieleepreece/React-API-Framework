/**
 * Standard methods for API calls / interaction.
 *
 * @file   This files allows classes to manage API calls.
 * @author Jamie Lee Preece.
 * @since  14/2/2019
 */

import * as APIContext from './APIContext';
import APIConfig from './Constants';

export default class APICalls {

  /**
    * Create instance of APICalls.
    * @param {object} that - The calling class 
    */
  constructor(that) {
    this.that = that;
    this.initTimeoutAttempts = this.initTimeoutAttempts.bind(this);
    this.checkTokenValidity = this.checkTokenValidity.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
    this.unload = this.unload.bind(this);
    this.toAPI = this.toAPI.bind(this);
    this.domain = APIConfig.api_dns;
    this.timeoutAttempts = 0;
    this.timeout = 15000;
  }

  /**
   * Allows multiple API timeout attempts.
   * Requires the calling class to have the following states: {fetch_timeout: false, load: false}
   *
   * @fires unload
   *  - Unloads the state `load`, which is used for the spinner and other logic
   *
   * @fires operationCallback
   *  - Callback to fire from within 'primiseCallback's 'resolve()' callback. This is used to signify if the data returned was successful.
   *
   * @param {function}  primiseCallback 
   *  - Requires a promise to execute. The promise containing the XHR call
   *
   * @param {function}  endTimeoutCallback
   *  - Function callback to fire if the request was unsuccessful and timed out
   *
   * @param {function}  serverResponseCallback
   *  - Function callback to fire if the XHR response status was 200. This can be an error, or success response.
   */
  initTimeoutAttempts(primiseCallback, endTimeoutCallback = null, serverResponseCallback = null) {

    if (this.timeoutAttempts < 5) {

      let APITimeout = primiseCallback();

      APITimeout.then((operationCallback) => {
        this.unload();
        if (operationCallback !== 'undefined' && operationCallback !== null && operationCallback instanceof Function) {
          operationCallback();
        }
        if (serverResponseCallback !== null) {
          serverResponseCallback();
        }
      });

      APITimeout.catch((err) => {
        this.timeoutAttempts ++;
        this.initTimeoutAttempts(primiseCallback);
        console.error('Error. Attempt failed. Attempts remaining: ' + (5 - this.timeoutAttempts) + '.');
      });

    }
    else{

      if (endTimeoutCallback !== null) {
        endTimeoutCallback();
      }
      else{
        this.that.setState({
          load: false,
          fetch_timeout: true
        });
      }
    }
  }

  /**
   * Check token validity
   * Refreshes token if access has expired, but refresh token remains.
   * @param {function}  apiFetchCallback
   */
  checkTokenValidity(apiFetchCallback) {
      
    let epochDate = new Date();
    let epochTimestampSeconds = Math.floor(epochDate.getTime() / 1000); 
    let accessExpiry = Number(this.that.state.expire_timestamp);

    console.log('* Token remaining seconds: ' + (accessExpiry - epochTimestampSeconds));

    if (this.that.state.expire_timestamp == null) {
      console.error('* Cannot execute API call - User is signed out');
    }
    else{
      if (epochTimestampSeconds >= accessExpiry) {
        console.log('* Expired - Attempt token refresh, then attempt fetch callback');
        this.refreshToken(apiFetchCallback);
      }
      else{
        apiFetchCallback();
      }
    }
  }

  /**
   * Refresh token attempt
   * @param {function} apiFetchCallback
   */
  refreshToken(apiFetchCallback) {

    // No need for access token on Auth header for middleware, as the refresh token provides this
    let data = {
      grant_type: 'refresh_token',
      refresh_token: this.that.state.refresh_token,
      client_id: 'bluezebra',
      client_secret: 'sd',
      scope: 'basic',
    };

    fetch(this.toAPI('/client/token/refresh'), {
      method: "POST", 
      body: JSON.stringify(data),
      mode: "cors",
      cache: "no-cache",
      credentials: "omit",
      headers: {
        "Accept": 'application/json',
        "Content-Type": "application/json",
      },
      referrer: "react-client",
    })
      .then(response => response.json())
      .then(data => {

        return new Promise((resolve, reject) => {

          if (typeof data.access_token === 'string' && data.access_token.length) {

            let currentDate = new Date();
            let timestamp_seconds = Math.floor(currentDate.getTime() / 1000) + data.expires_in; 

            // APIContext.clearLocal();
            APIContext.clearTokens();

            APIContext.setLocal({
              token_type: data.token_type,
              expires_in: data.expires_in,
              access_token: data.access_token,
              refresh_token: data.refresh_token,
              expire_timestamp: timestamp_seconds 
            }, () => {

                this.that.setState({ 
                  token_type: data.token_type,
                  expires_in: data.expires_in,
                  access_token: data.access_token,
                  refresh_token: data.refresh_token,
                  expire_timestamp: timestamp_seconds 
                }, resolve());

                // Reject if state is not updated
                // May remove Reject, as setState is async
                // reject();
            });
          }
          else{
            reject();
          }

        });

      })
      .then(() => {
        console.log('Token refresh successful. Attempting callback');
        apiFetchCallback();
      })
      .catch(err => console.error('Failed to refresh token', err));
  }

  /**
   * Generate DNS and method string
   * Used to construct the full DNS, with supplied URI
   * @param {string}  uri
   * @returns string
   */
  toAPI(uri) {
    return this.domain + uri
  }

  /**
   * Remove loading bar from caller
   * Requires the calling class to have the following states: {load: false}
   * @fires parent.setState
   */
  unload() {
    this.that.setState({ 
      load: false
    });
  }
};