"""A Jupyter notebook server extension for sharing notebooks on Callisto """

from notebook.utils import url_path_join
from .handler import ShareFileHandler


def _jupyter_server_extension_paths():
    return [{"module": "callisto_nbshare"}]


def load_jupyter_server_extension(nb_server_app):
    """
    Called when the extension is loaded.

    Args:
        nb_server_app (NotebookWebApplication): 
            handle to the Notebook webserver instance.
    """
    web_app = nb_server_app.web_app
    host_pattern = '.*$'
    base_url = web_app.settings["base_url"]
    share_file_path = url_path_join(base_url, 'callisto/share/' + filename_regex)
    handlers = [
        (share_file_path, ShareFileHandler)
    ]
    web_app.add_handlers(".*$", handlers)
