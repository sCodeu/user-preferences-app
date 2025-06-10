function csrfSafeMethod(method) {
    return /^(GET|HEAD|OPTIONS|TRACE)$/.test(method);
}

function getCSRFToken() {
    return fetch("http://localhost:8000/api/csrf/", {
        credentials: "include"
    });
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function loadPreferencesScriptAndInit() {
    // Clear login UI
    const container = document.getElementById("preferences_app");
    container.innerHTML = "";

    // Dynamically load preferences.js
    const script = document.createElement("script");
    script.src = "/static/preferences/preferences.js";
    script.onload = function() {
        loadUserPreferences();
    };
    document.body.appendChild(script);
}

function loginUser(username, password) {
    getCSRFToken().then(() => {
        const csrftoken = getCookie("csrftoken");

        webix.ajax()
            .headers({ "X-CSRFToken": csrftoken }) 
            .post("http://localhost:8000/api/login/", {
                username: username,
                password: password
            }, {
                credentials: "include",
                success: function (text, data) {
                    webix.message("Login successful!");
                    loadPreferencesScriptAndInit();
                },
                error: function () {
                    webix.message({ type: "error", text: "Login failed!" });
                }
            });
    });
}

webix.ui({
    view: "window",
    id: "login_window",
    container: "preferences_app",
    width: 400,
    height: 350,
    move: true,
    position: "center",
    head: {
        cols: [
            { template: "🔐 Login", borderless: true,
                css: { "text-align": "center", "font-size": "18px", "font-weight": "bold" }  
            }

        ]
    },
    body: {
        padding: 20,
        rows: [
            { template: "<div style='text-align:center'><img src='/static/preferences/logo.png' style='height:80px; margin-bottom: 10px;'></div>", borderless: true },
            {
                view: "form",
                id: "login_form",
                elements: [
                    { view: "text", name: "username", label: "Username", labelWidth: 100, css: "rounded-box" },
                    { view: "text", name: "password", type: "password", label: "Password", labelWidth: 100, css: "rounded-box" },
                    {
                        view: "button", value: "Login", css: "webix_primary rounded-button",
                        click: function () {
                            const form = $$("login_form").getValues();
                            loginUser(form.username, form.password);
                        }
                    }
                ]
            }
        ]
    }
});

$$("login_window").show();

