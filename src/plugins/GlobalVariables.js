const GlobalVariables = {
  install: (app) => {
    const GlobalVariables = {
      disableCypherInput: false,
      disableTextInput: true,
      outputPanelHeight: 580
    }
    app.provide('GlobalVariables', GlobalVariables)
  }
}

export { GlobalVariables }
