(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* nav toggle */
  var nav = document.getElementById("nav");
  var toggle = document.getElementById("navToggle");
  var menu = document.getElementById("navMenu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
      document.body.style.overflow = open ? "hidden" : "";
    });
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A" && menu.classList.contains("open")) {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Открыть меню");
        document.body.style.overflow = "";
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.classList.contains("open")) {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Открыть меню");
        document.body.style.overflow = "";
        toggle.focus();
      }
    });
  }

  /* section reveal */
  var fades = document.querySelectorAll(".fade");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -60px 0px" });
    fades.forEach(function (el) { io.observe(el); });
  } else {
    fades.forEach(function (el) { el.classList.add("in"); });
  }

  /* tagline word reveal */
  var tag = document.querySelector("[data-split]");
  if (tag) {
    var words = tag.textContent.trim().split(/\s+/);
    tag.textContent = "";
    words.forEach(function (w, i) {
      var s = document.createElement("span");
      s.className = "w";
      s.textContent = w;
      tag.appendChild(s);
      if (i < words.length - 1) tag.appendChild(document.createTextNode(" "));
    });
    var spans = tag.querySelectorAll(".w");
    if ("IntersectionObserver" in window && !reduce) {
      var io2 = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          spans.forEach(function (sp, i) {
            setTimeout(function () { sp.classList.add("on"); }, i * 55);
          });
          io2.unobserve(en.target);
        });
      }, { threshold: 0.35 });
      io2.observe(tag);
    } else {
      spans.forEach(function (sp) { sp.classList.add("on"); });
    }
  }

  /* form */
  // ENDPOINT: укажите URL вашего бэкенда. Пока пусто — форма работает в демо-режиме
  // (валидирует адрес и показывает подтверждение, ничего не отправляя).
  var ENDPOINT = "";
  var form = document.getElementById("signupForm");
  var msg = document.getElementById("formMsg");
  if (form) {
    var input = document.getElementById("email");
    var submit = form.querySelector('button[type="submit"]');
    var idleLabel = submit ? submit.textContent : "";

    function setBusy(on) {
      if (!submit) return;
      submit.disabled = on;
      submit.textContent = on ? "Отправляем..." : idleLabel;
      form.setAttribute("aria-busy", on ? "true" : "false");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var v = (input.value || "").trim();
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
      input.classList.toggle("err", !ok);
      msg.classList.remove("ok");
      if (!ok) {
        msg.textContent = v ? "Проверьте адрес: похоже, в нём опечатка." : "Укажите рабочую почту, чтобы мы открыли доступ.";
        input.focus();
        return;
      }

      if (!ENDPOINT) {
        msg.classList.add("ok");
        msg.textContent = "Готово. Письмо со ссылкой ушло на " + v + ".";
        form.reset();
        return;
      }

      setBusy(true);
      msg.textContent = "";
      fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: v, source: "landing" })
      })
        .then(function (res) {
          if (!res.ok) throw new Error("HTTP " + res.status);
          return res;
        })
        .then(function () {
          msg.classList.add("ok");
          msg.textContent = "Готово. Письмо со ссылкой ушло на " + v + ".";
          form.reset();
        })
        .catch(function () {
          msg.classList.remove("ok");
          msg.textContent = "Не удалось отправить. Проверьте соединение и попробуйте ещё раз.";
        })
        .then(function () {
          setBusy(false);
        });
    });

    input.addEventListener("input", function () {
      input.classList.remove("err");
      if (msg.textContent) msg.textContent = "";
    });
  }
})();