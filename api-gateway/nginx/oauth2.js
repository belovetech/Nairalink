function introspectAccessToken(r) {
  r.subrequest("/_oauth2_send_request",
    function(reply) {
      if (reply.status == 200) {
        var response = JSON.parse(reply.responseBody);
        if (response.active == true) {
          for (var p in response) {
            if (!response.hasOwnProperty(p)) continue;
            r.log("OAuth2 Token-" + p + ": " + response[p]);
            r.headersOut['Token-' + p] = response[p];
          }
          r.status = 204;
          r.sendHeader();
          r.finish();
        } else {
          r.return(403); // Token is invalid, return forbidden code
        }
      } else {
        r.return(401); // Unexpected response, return 'auth required'
      }
    }
  );
}

export default { introspectAccessToken }
