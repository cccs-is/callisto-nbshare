"""Tornado handler for notebook file share to Callisto""" 

import json

from tornado import web
from notebook.base.handlers import APIHandler

from .manager import manager

class FileShareHandler(APIHandler):
    """
    A tornado HTTP handler for sharin files 
    """

    @web.authenticated
    def get(self, filepath: str = "") -> None:
        """
        share the filepath notebook to Callisto
        """
        if filepath != "":
            print('get() -> sharing... {} ... on Callisto!!!! TBD...'.format(filepath))


    @web.authenticated
    async def put(self, filepath: str = "") -> None:
        """
        share the filepath notebook to Callisto
        """
        if filepath != "":
            print('put() -> sharing... {} ... on Callisto!!!! TBD...'.format(filepath))

