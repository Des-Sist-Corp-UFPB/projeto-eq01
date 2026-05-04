window.onload = function () {
  window.ui = SwaggerUIBundle({
    url: "/v3/api-docs",
    dom_id: "#swagger-ui",
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    layout: "StandaloneLayout"
  });
};
