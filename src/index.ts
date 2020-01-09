import {
  JupyterFrontEnd, JupyterFrontEndPlugin
} from '@jupyterlab/application';


/**
 * Initialization data for the callisto-nbshare extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'callisto-nbshare',
  autoStart: true,
  activate: (app: JupyterFrontEnd) => {
    console.log('JupyterLab extension callisto-nbshare is activated!');
  }
};

export default extension;
