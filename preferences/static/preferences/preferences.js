let CURRENT_USER_ID = null;

function loadUserPreferences() {
  webix.ajax().get("http://localhost:8000/api/preferences/me/", {
    xhrFields: { withCredentials: true },
    success: function (text, data) {
      let prefs;
      try {
        prefs = data.json();
      } catch (err) {
        console.error("Invalid JSON response:", text);
        webix.message({
          type: "error",
          text: "Failed to load user preferences (invalid response).",
        });
        return;
      }
      CURRENT_USER_ID = prefs.id;

      $$("toolbar_label").setValue(`Welcome! , ${prefs.username}`);

      $$("account_form").setValues({
        username: prefs.username,
        email: prefs.email,
      });

      $$("notification_form").setValues({
        email_notifications: prefs.email_notifications,
        push_notifications: prefs.push_notifications,
        notification_frequency: prefs.notification_frequency,
      });

      $$("theme_form").setValues({
        theme_color: prefs.theme_color,
        font_size: prefs.font_size,
        layout: prefs.layout,
      });

      $$("privacy_form").setValues({
        profile_visible: prefs.profile_visible,
        data_sharing: prefs.data_sharing,
      });
    },
    error: function () {
      webix.message({
        type: "error",
        text: "Authentication required. Redirecting to login...",
      });
    },
  });
}

function savePreferences() {
  const forms = [
    "account_form",
    "notification_form",
    "theme_form",
    "privacy_form",
  ];
  const allValid = forms.every((formId) => {
    const valid = $$(formId).validate();
    if (!valid)
      webix.message({ type: "error", text: `Validation failed in: ${formId}` });
    return valid;
  });

  if (!allValid) return;

  if (!CURRENT_USER_ID) {
    webix.message({ type: "error", text: "User ID not loaded yet!" });
    return;
  }

  const data = {
    ...$$("account_form").getValues(),
    ...$$("notification_form").getValues(),
    ...$$("theme_form").getValues(),
    ...$$("privacy_form").getValues(),
    user: CURRENT_USER_ID,
  };

  const csrfToken = getCookie("csrftoken");

  const xhr = new XMLHttpRequest();
  xhr.open("PUT", "http://localhost:8000/api/preferences/me/", true);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.setRequestHeader("X-CSRFToken", csrfToken);
  xhr.withCredentials = true;

  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      webix.message("Preferences saved!");
      loadUserPreferences();
    } else {
      try {
        const errorResponse = JSON.parse(xhr.responseText);
        const errorText = Object.values(errorResponse).flat().join(", ");
        webix.message({ type: "error", text: "Server error: " + errorText });
      } catch {
        webix.message({ type: "error", text: "Unknown server error" });
      }
    }
  };

  xhr.onerror = function () {
    webix.message({ type: "error", text: "Network or server error" });
  };

  xhr.send(JSON.stringify(data));
  // loadUserPreferences();
}

function logoutUser() {
  const csrfToken = getCookie("csrftoken");

  webix
    .ajax()
    .headers({
      "X-CSRFToken": csrfToken,
      "Content-Type": "application/x-www-form-urlencoded",
    })
    .post("http://localhost:8000/api/logout/", "dummy=1", {
      xhrFields: {
        withCredentials: true,
      },
    })
    .then(function () {
      webix.message("Logged out successfully!");
      window.location.href = "/api/preferences/";
    })
    .catch(function (err) {
      webix.message({ type: "error", text: "Logout failed: " + err.status });
    });
}

webix.ui({
  container: "preferences_app",
  rows: [
    {
      view: "toolbar",
      elements: [
        {
          view: "label",
          id: "toolbar_label",
          label: "User Preferences ",
          css: "custom-toolbar-label",
        },
        {},
        {
          view: "button",
          label: "Logout",
          width: 100,
          css: "webix_danger rounded-button logout-button",
          click: logoutUser,
        },
      ],
    },
    {
      view: "tabbar",
      id: "tabs",
      multiview: true,
      gravity: 0.1,
      options: [
        {
          id: "account",
          value: "<span class='webix_icon wxi-user'></span> Account",
        },
        {
          id: "notification",
          value: "<span class='webix_icon wxi-alert'></span> Notification",
        },
        {
          id: "theme",
          value: "<span class='webix_icon wxi-pencil'></span> Theme",
        },
        {
          id: "privacy",
          value: "<span class='webix_icon wxi-minus'></span> Privacy",
        },
      ],
    },
    {
      gravity: 0.1,
      cells: [
        {
          id: "account",
          rows: [
            { gravity: 1 },
            {
              cols: [
                { gravity: 1 },
                {
                  view: "form",
                  id: "account_form",
                  width: 600,
                  padding: 20,
                  borderless: false,
                  css: "webix_card",
                  responsive: true,
                  rules: {
                    username: webix.rules.isNotEmpty,
                    email: webix.rules.isEmail,
                  },
                  elements: [
                    {
                      view: "text",
                      label: "Username",
                      name: "username",
                      css: "rounded-box",
                    },
                    {
                      view: "text",
                      label: "Email",
                      name: "email",
                      css: "rounded-box",
                    },
                    {
                      view: "button",
                      value: "Save",
                      align: "center",
                      click: savePreferences,
                      css: "save-button",
                    },
                  ],
                },
                { gravity: 1 },
              ],
            },
            { gravity: 1 },
          ],
        },
        {
          id: "notification",
          rows: [
            { gravity: 1 },
            {
              cols: [
                { gravity: 1 },
                {
                  view: "form",
                  id: "notification_form",
                  width: 600,
                  padding: 20,
                  css: "webix_card",
                  responsive: true,
                  rules: {
                    notification_frequency: webix.rules.isNotEmpty,
                  },
                  elements: [
                    {
                      view: "checkbox",
                      labelRight: "Email Notifications",
                      name: "email_notifications",
                    },
                    {
                      view: "checkbox",
                      labelRight: "Push Notifications",
                      name: "push_notifications",
                    },
                    {
                      view: "richselect",
                      label: "Frequency",
                      name: "notification_frequency",
                      options: ["instant", "daily", "weekly"],
                      css: "rounded-color-box",
                    },
                    {
                      view: "button",
                      value: "Save",
                      align: "center",
                      click: savePreferences,
                      css: "save-button",
                    },
                  ],
                },
                { gravity: 1 },
              ],
            },
            { gravity: 1 },
          ],
        },
        {
          id: "theme",
          rows: [
            { gravity: 1 },
            {
              cols: [
                { gravity: 1 },
                {
                  view: "form",
                  id: "theme_form",
                  width: 600,
                  padding: 20,
                  css: "webix_card",
                  responsive: true,
                  elements: [
                    {
                      view: "colorpicker",
                      label: "Theme Color",
                      name: "theme_color",
                      css: "rounded-color-box",
                      labelWidth: 120,
                      stringResult: true,
                      value: "#ffffff",
                      suggest: {
                        type: "colorboard",
                      },
                    },
                    {
                      view: "text",
                      label: "Font Size",
                      name: "font_size",
                      css: "rounded-box",
                      labelWidth: 120,
                    },
                    {
                      view: "text",
                      label: "Layout",
                      name: "layout",
                      css: "rounded-box",
                      labelWidth: 120,
                    },
                    {
                      view: "button",
                      value: "Save",
                      align: "center",
                      click: savePreferences,
                      css: "save-button",
                    },
                  ],
                },
                { gravity: 1 },
              ],
            },
            { gravity: 1 },
          ],
        },
        {
          id: "privacy",
          rows: [
            { gravity: 1 },
            {
              cols: [
                { gravity: 1 },
                {
                  view: "form",
                  id: "privacy_form",
                  width: 600,
                  padding: 20,
                  css: "webix_card",
                  responsive: true,
                  elements: [
                    {
                      view: "checkbox",
                      labelRight: "Profile Visible",
                      name: "profile_visible",
                    },
                    {
                      view: "checkbox",
                      labelRight: "Data Sharing",
                      name: "data_sharing",
                    },
                    {
                      view: "button",
                      value: "Save",
                      align: "center",
                      click: savePreferences,
                      css: "save-button",
                    },
                  ],
                },
                { gravity: 1 },
              ],
            },
            { gravity: 1 },
          ],
        },
      ],
    },
  ],
});
