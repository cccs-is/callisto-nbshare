import { IDisposable } from '@phosphor/disposable';

import {
  showErrorMessage,
  ToolbarButton,
  ICommandPalette
} from '@jupyterlab/apputils';

import { DocumentRegistry } from '@jupyterlab/docregistry';

import {
  INotebookTracker,
  NotebookPanel, 
  INotebookModel,
} from '@jupyterlab/notebook';

import {
  JupyterFrontEnd, JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IFileBrowserFactory } from '@jupyterlab/filebrowser';

import {  ReadonlyPartialJSONObject } from '@lumino/coreutils';

import {  toArray } from '@lumino/algorithm';

import { ServerConnection } from '@jupyterlab/services';


/**
 * The command IDs used by the extensions
 */
namespace CommandIDs {
  export const shareNotebookFile    = 'callisto:share-notebook-file';
  export const shareNotebookCurrent = 'callisto:share-notebook-current';
}

export const buttonClassName = 'shareOnCallistoButton';
export const shareCommandLabel =  'Share on Callisto'


/***
 * our share button on the notebook toobar
 */
export
class ShareNotebookButtonExtension implements DocumentRegistry.IWidgetExtension<NotebookPanel, INotebookModel> {

  /***
   */
  constructor(app: JupyterFrontEnd) {
    this.app = app;
  }

  readonly app: JupyterFrontEnd;

  /***
   * create the extension object
   */
  createNew(panel: NotebookPanel, context: DocumentRegistry.IContext<INotebookModel>): IDisposable {
    // create the on-click callback for the toolbar button.
    let shareNotebook = () => {
      //console.log('Sharing notebook on Callisto!!!.');
      this.app.commands.execute(CommandIDs.shareNotebookCurrent);
    };

    // create the toolbar button
    let button = new ToolbarButton({
      className: buttonClassName,
      iconClassName: 'fa fa-share-square-o',
      onClick: shareNotebook,
      tooltip: 'Share on Callisto'
    });

    // add the toolbar button to the notebook
    panel.toolbar.insertItem(1, 'buttonClassName', button);

    // The ToolbarButton class implements `IDisposable`, so the
    // button *is* the extension for the purposes of this method.
    return button;

  }
}

/**
 * Add the main file browser commands to the application's command registry.
 */
function addCommands(
    app: JupyterFrontEnd,
    fileBrowserFactory: IFileBrowserFactory,
    notebookTracker: INotebookTracker,
    commandPalette: ICommandPalette | null,
    serverSettings: ServerConnection.ISettings 
): void {

  const { commands, shell } = app;
  const { tracker: fileBrowser } = fileBrowserFactory;

  // Get the current widget and activate unless the args specify otherwise.
  // helper function...
  function getCurrent(args: ReadonlyPartialJSONObject): NotebookPanel | null {
    const widget = notebookTracker.currentWidget;
    const activate = args['activate'] !== false;

    //console.log('getCurrent()->args:', args)
    //console.log('getCurrent()->activate:', activate)
    if (activate && widget) {
      shell.activateById(widget.id);
    }

    return widget;
  }

  /**
   * share file with Callisto
   */
  const shareFile = async(filepath: string): Promise<void> => {
    const response = await ServerConnection.makeRequest(
      `${serverSettings.baseUrl}callisto/share/${filepath}`,
      {method: 'PUT'},
      serverSettings
    );

    console.log('got status code:', response.status)
    if (response.status !== 200) {
      //const msg = 
      //  'Failed to send file to Callisto... contact your system administrator';
      //const err = new Error(msg);
      const err = await response.json();
      void showErrorMessage('Error sharing on Callisto', err);
      throw err;
    }
    else {
      void showErrorMessage('Notebook sharing', 'File is shared on Callisto');
    }
  }


  commands.addCommand(CommandIDs.shareNotebookFile, {
    execute: () => {
      const widget = fileBrowser.currentWidget;
      if (widget) {
        Promise.all(toArray(widget.selectedItems())
               .filter(item => item.type !== 'directory')
               .map(item => shareFile(item.path)));
      }
      
    },
    iconClass: 'fa fa-share-square-o',
    label: shareCommandLabel
  });
      

  commands.addCommand(CommandIDs.shareNotebookCurrent, {
    execute: args => {
      const current = getCurrent(args);

      if (current) {
        //console.log('context:', current.context)
        shareFile(current.context.path)
      }
    },
    iconClass: 'fa fa-share-square-o',
    label: shareCommandLabel
  });


  // Add the command to the command palette, for testing only...
  //if (commandPalette) {
  //  commandPalette.addItem({
  //    command: secondCommandID,
  //    category: 'File Operations'
  //  });
  //}
}


/**
 * extension registeration information and configuration
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'callisto-nbshare',
  autoStart: true,
  requires: [
    IFileBrowserFactory,
    INotebookTracker
    //ISettingRegistry
  ],
  optional: [ICommandPalette],
  activate: activateExtension
}

/**
 * Activate the textension
 */
function activateExtension (
  app: JupyterFrontEnd,
  factory: IFileBrowserFactory,
  notebookTracker: INotebookTracker,
  commandPalette: ICommandPalette | null
): void  {

  let buttonExtension = new ShareNotebookButtonExtension(app);
  app.docRegistry.addWidgetExtension('Notebook', buttonExtension);
  console.log('JupyterLab extension callisto-nbshare is activated!');

  let serverSettings = ServerConnection.makeSettings();

  // Register the commands.
  addCommands(
    app,
    factory,
    notebookTracker,
    commandPalette,
    serverSettings
  );

  /***
   * Add shareNotebookFile to the file browser context menu
   */
  // matches only non-dir items
  const selectorContent = '.jp-DirListing-item[data-isdir="false"]'; 

  app.contextMenu.addItem({
    command: CommandIDs.shareNotebookFile,
    selector: selectorContent,
    rank: 8
  });

}

export default extension;
