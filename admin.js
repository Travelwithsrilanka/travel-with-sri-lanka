import {
  createClient
} from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";


/* =========================================================
   SUPABASE
========================================================= */

const SUPABASE_URL =
  "https://vbbmnzqrvoceqbwwwsrc.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_HZ1A8CURkRFs0v21FUT0VA_44dtPzr3";

const supabase =
  createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    }
  );


/* =========================================================
   ELEMENTS
========================================================= */

const loginForm =
  document.getElementById(
    "adminLoginForm"
  );

const loginButton =
  document.getElementById(
    "loginBtn"
  );

const loginMessage =
  document.getElementById(
    "loginMessage"
  );


/* =========================================================
   SESSION CHECK
========================================================= */

async function checkExistingSession() {

  try {

    const {
      data,
      error
    } = await supabase.auth.getSession();


    if (error) {
      console.error(error);
      return;
    }


    if (data?.session) {

      window.location.replace(
        "admin-dashboard.html"
      );

    }

  } catch (error) {

    console.error(
      "Session check error:",
      error
    );

  }

}


/* =========================================================
   LOGIN
========================================================= */

if (loginForm) {

  loginForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();


      const email =
        document.getElementById(
          "adminEmail"
        )?.value.trim() || "";


      const password =
        document.getElementById(
          "adminPassword"
        )?.value || "";


      if (!email || !password) {
        return;
      }


      loginButton.disabled = true;
      loginButton.textContent =
        "Logging in...";


      setMessage(
        "",
        ""
      );


      try {

        const {
          data,
          error
        } = await supabase.auth
          .signInWithPassword({
            email,
            password
          });


        if (error) {
          throw error;
        }


        if (!data?.session) {

          throw new Error(
            "Login session could not be created."
          );

        }


        setMessage(
          "Login successful. Opening dashboard...",
          "success"
        );


        setTimeout(
          () => {

            window.location.replace(
              "admin-dashboard.html"
            );

          },
          300
        );


      } catch (error) {

        console.error(
          "Login error:",
          error
        );


        setMessage(
          getLoginError(error),
          "error"
        );


        loginButton.disabled = false;
        loginButton.textContent =
          "Login";

      }

    }
  );

}


/* =========================================================
   MESSAGE
========================================================= */

function setMessage(
  message,
  type
) {

  if (!loginMessage) {
    return;
  }

  loginMessage.textContent =
    message;

  loginMessage.style.color =
    type === "success"
      ? "#176b4d"
      : type === "error"
        ? "#c0392b"
        : "#555";

}


/* =========================================================
   ERROR
========================================================= */

function getLoginError(error) {

  const message =
    String(
      error?.message || ""
    ).toLowerCase();


  if (
    message.includes(
      "invalid login credentials"
    )
  ) {

    return "Invalid email or password.";

  }


  if (
    message.includes(
      "email not confirmed"
    )
  ) {

    return "Please confirm the administrator email in Supabase.";

  }


  return (
    error?.message ||
    "Login failed. Please try again."
  );

}


/* =========================================================
   START
========================================================= */

checkExistingSession();
