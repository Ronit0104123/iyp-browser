const GlobalVariables = {
  install: (app) => {
    const GlobalVariables = {
      outputPanelHeight: 580,
      graphOverviewPanelWidth: 250,
      disableOutputPanelResizer: false,
      disableGraphOverviewPanelResizer: false,
    }
    app.provide('GlobalVariables', GlobalVariables)
  }
}

export { GlobalVariables }
