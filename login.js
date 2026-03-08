// Future Self — Login Page Logic

(function () {
  var tabSignup = document.getElementById("tab-signup");
  var tabLogin = document.getElementById("tab-login");
  var formSignup = document.getElementById("form-signup");
  var formLogin = document.getElementById("form-login");

  // Tab switching
  tabSignup.addEventListener("click", function () {
    tabSignup.classList.add("fs-active");
    tabLogin.classList.remove("fs-active");
    formSignup.classList.add("fs-active");
    formLogin.classList.remove("fs-active");
  });

  tabLogin.addEventListener("click", function () {
    tabLogin.classList.add("fs-active");
    tabSignup.classList.remove("fs-active");
    formLogin.classList.add("fs-active");
    formSignup.classList.remove("fs-active");
  });

  // Sign Up
  document.getElementById("btn-signup").addEventListener("click", async function () {
    var btn = this;
    var email = document.getElementById("signup-email").value.trim();
    var password = document.getElementById("signup-password").value;
    var errorEl = document.getElementById("signup-error");
    var successEl = document.getElementById("signup-success");

    errorEl.classList.remove("fs-visible");
    successEl.classList.remove("fs-visible");

    if (!email || !password) {
      showError(errorEl, "Please enter both email and password.");
      return;
    }
    if (password.length < 6) {
      showError(errorEl, "Password must be at least 6 characters.");
      return;
    }

    btn.disabled = true;
    btn.textContent = "Creating account...";

    try {
      var data = await SupabaseAuth.signUp(email, password);

      if (data.access_token) {
        // Signed up and logged in immediately
        window.location.href = chrome.runtime.getURL("options.html");
      } else {
        // Email confirmation required
        successEl.textContent = "Check your email to confirm your account, then log in.";
        successEl.classList.add("fs-visible");
        btn.textContent = "Start Free Trial — 24 Hours Free";
        btn.disabled = false;
      }
    } catch (e) {
      showError(errorEl, e.message);
      btn.textContent = "Start Free Trial — 24 Hours Free";
      btn.disabled = false;
    }
  });

  // Log In
  document.getElementById("btn-login").addEventListener("click", async function () {
    var btn = this;
    var email = document.getElementById("login-email").value.trim();
    var password = document.getElementById("login-password").value;
    var errorEl = document.getElementById("login-error");

    errorEl.classList.remove("fs-visible");

    if (!email || !password) {
      showError(errorEl, "Please enter both email and password.");
      return;
    }

    btn.disabled = true;
    btn.textContent = "Logging in...";

    try {
      await SupabaseAuth.signIn(email, password);
      var status = await SupabaseAuth.checkAuthStatus();

      if (status.isPaid || status.isTrialActive) {
        window.location.href = chrome.runtime.getURL("options.html");
      } else {
        // Trial expired, not paid — show upgrade
        window.location.href = chrome.runtime.getURL("upgrade.html");
      }
    } catch (e) {
      showError(errorEl, e.message);
      btn.textContent = "Log In";
      btn.disabled = false;
    }
  });

  // Enter key support
  document.getElementById("signup-password").addEventListener("keydown", function (e) {
    if (e.key === "Enter") document.getElementById("btn-signup").click();
  });
  document.getElementById("login-password").addEventListener("keydown", function (e) {
    if (e.key === "Enter") document.getElementById("btn-login").click();
  });

  // Forgot Password
  document.getElementById("forgot-toggle").addEventListener("click", function () {
    var section = document.getElementById("forgot-section");
    section.classList.toggle("fs-visible");
    if (section.classList.contains("fs-visible")) {
      document.getElementById("forgot-email").focus();
    }
  });

  document.getElementById("btn-forgot").addEventListener("click", async function () {
    var btn = this;
    var email = document.getElementById("forgot-email").value.trim();
    var errorEl = document.getElementById("forgot-error");
    var successEl = document.getElementById("forgot-success");

    errorEl.classList.remove("fs-visible");
    successEl.classList.remove("fs-visible");

    if (!email) {
      showError(errorEl, "Please enter your email address.");
      return;
    }

    btn.disabled = true;
    btn.textContent = "Sending...";

    try {
      await SupabaseAuth.resetPassword(email);
      successEl.textContent = "Check your email for a reset link.";
      successEl.classList.add("fs-visible");
    } catch (e) {
      showError(errorEl, e.message);
    }

    btn.textContent = "Send Reset Link";
    btn.disabled = false;
  });

  document.getElementById("forgot-email").addEventListener("keydown", function (e) {
    if (e.key === "Enter") document.getElementById("btn-forgot").click();
  });

  // Google Sign-In
  document.getElementById("btn-google-signup").addEventListener("click", signInWithGoogle);
  document.getElementById("btn-google-login").addEventListener("click", signInWithGoogle);

  async function signInWithGoogle() {
    var redirectUrl = chrome.identity.getRedirectURL();
    var authUrl = SUPABASE_URL + "/auth/v1/authorize"
      + "?provider=google"
      + "&redirect_to=" + encodeURIComponent(redirectUrl);

    // Show loading state on whichever form is active
    var signupError = document.getElementById("signup-error");
    var loginError = document.getElementById("login-error");
    signupError.classList.remove("fs-visible");
    loginError.classList.remove("fs-visible");

    try {
      var callbackUrl = await new Promise(function (resolve, reject) {
        chrome.identity.launchWebAuthFlow(
          { url: authUrl, interactive: true },
          function (responseUrl) {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else if (!responseUrl) {
              reject(new Error("No response from Google sign-in."));
            } else {
              resolve(responseUrl);
            }
          }
        );
      });

      // Parse tokens from the callback URL fragment
      var hashFragment = callbackUrl.split("#")[1];
      if (!hashFragment) {
        throw new Error("No authentication data received.");
      }

      var params = new URLSearchParams(hashFragment);
      var accessToken = params.get("access_token");
      var refreshToken = params.get("refresh_token");
      var expiresIn = params.get("expires_in");

      if (!accessToken) {
        throw new Error("No access token received from Google sign-in.");
      }

      // Store tokens in chrome.storage.local
      var toStore = {
        futureself_access_token: accessToken
      };
      if (refreshToken) {
        toStore.futureself_refresh_token = refreshToken;
      }
      if (expiresIn) {
        toStore.futureself_token_expires_at = Date.now() + (parseInt(expiresIn, 10) * 1000);
      }

      // Fetch user info from Supabase
      var userRes = await fetch(SUPABASE_URL + "/auth/v1/user", {
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": "Bearer " + accessToken
        }
      });
      var userData = await userRes.json();
      if (!userRes.ok) {
        throw new Error(userData.message || "Failed to fetch user info.");
      }

      if (userData.email) {
        toStore.futureself_user_email = userData.email;
      }

      await chrome.storage.local.set(toStore);

      // Create/update profile in Supabase profiles table
      var trialExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      await fetch(SUPABASE_URL + "/rest/v1/profiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": "Bearer " + accessToken,
          "Prefer": "resolution=merge-duplicates"
        },
        body: JSON.stringify({
          id: userData.id,
          trial_expires_at: trialExpiresAt,
          is_paid: false
        })
      });

      // Redirect to options page on success
      window.location.href = chrome.runtime.getURL("options.html");

    } catch (e) {
      // Show error on whichever form tab is currently active
      var activeForm = document.querySelector(".fs-form.fs-active");
      var errorEl = activeForm
        ? activeForm.querySelector(".fs-error")
        : loginError;
      showError(errorEl, e.message || "Google sign-in failed.");
    }
  }

  function showError(el, msg) {
    el.textContent = msg;
    el.classList.add("fs-visible");
  }
})();
