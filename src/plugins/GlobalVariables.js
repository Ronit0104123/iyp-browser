const GlobalVariables = {
  install: (app) => {
    const GlobalVariables = {
      outputPanelHeight: 580,
    };
    app.provide("GlobalVariables", GlobalVariables);
  },
};

export { GlobalVariables };
