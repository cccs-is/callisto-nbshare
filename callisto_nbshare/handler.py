"""Tornado handler for notebook file share to Callisto""" 
import os
import logging
import requests

from tornado import web
from notebook.base.handlers import APIHandler

ENDPOINT_UPLOAD = '/nbupload/'
ENDPOINT_POST_SHARE = '/shared/'

# This is the cookie name used by OAuth2 proxy
# By default it is '_oauth2_proxy' and can be changed using '-cookie-name' config on the OAuth2 proxy.
OAUTH_COOKIE_NAME = '_oauth2_proxy'

logger = logging.getLogger(__name__)


class ShareFileHandler(APIHandler):
    """
    A tornado HTTP handler for sharin files 
    """

    @web.authenticated
    def get(self, filepath: str = "") -> None:
        """
        share the filepath notebook to Callisto
        """
        if filepath != "":
            print('get() -> sharing... {} ... on Callisto!!!!...'.format(filepath))
            self.share(filepath)


    @web.authenticated
    async def put(self, filepath: str = "") -> None:
        """
        share the filepath notebook to Callisto
        """
        if filepath != "":
            print('put() -> sharing... {} ... on Callisto!!!!...'.format(filepath))
            self.share(filepath)
            print('put() -> status code:', this.status_code)


    def share(self, filename):
      base_url = os.getenv('JUPYTER_CALLISTO_URL', 'http://127.0.0.1:5000/').rstrip('/')
      access_token = os.getenv('NOTEBOOK_ACCESS_TOKEN')
      if not access_token:
          access_token = self.request.headers.get('X-Access-Token', '')
  
      oauth_cookies = None
      if self.request.cookies is not None and OAUTH_COOKIE_NAME in self.request.cookies:
          oauth_cookies = {OAUTH_COOKIE_NAME: self.request.cookies[OAUTH_COOKIE_NAME].value}
  
      try:
          notebook_filename = os.path.basename(filename)
          nodebook_content = ''

          # print('.... in share()-> notebook_filename:', notebook_filename)
          with open(filename, 'r') as f:
            notebook_content = f.read()

          data = {'notebook_name': notebook_filename, 'notebook_contents': notebook_content}
  
          post_url = base_url + ENDPOINT_UPLOAD
  
          headers = {'Authorization': 'Bearer ' + access_token}
          response = requests.post(url=post_url, headers=headers, cookies=oauth_cookies, data=data, timeout=5.0)
           
          if response.status_code != 200:
              # TODO handle token refresh
              # self.finish('Upload failed. Gallery returned code: {0}'.format(response.status_code))
              raise web.HTTPError(response.status_code, "Upload failed. Please contact your system administrator.")

          # TBD!! do we need to redirect or just publish and return?!!!!  
          # redirect_url = base_url + ENDPOINT_POST_SHARE
          # self.redirect(redirect_url)
          self.set_status(response.status_code)
          self.finish()

      except Exception as e:
          logger.info('Exception while publishing notebook: {0}'.format(repr(e)))
          # self.finish('Your upload failed. Please contact your system administrator.\n{0}'.format(repr(e)))
          raise web.HTTPError(500, str(e))
 
