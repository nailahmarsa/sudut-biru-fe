// LOGIN
const formLogin = document.getElementById("form-login");

if (formLogin) {
  const username = document.getElementById("username");
  const password = document.getElementById("password");
  const tombolMasuk = document.getElementById("login-button");
  const pesan = document.getElementById("login-message");
  const tombolMata = document.getElementById("toggle-password");
  const ikonMata = document.getElementById("password-icon");

  function perbaruiPeran() {
    const peran = formLogin.querySelector('input[name="role"]:checked').value;
    tombolMasuk.textContent = `Masuk sebagai ${peran}`;
  }

  formLogin.querySelectorAll('input[name="role"]').forEach(input => {
    input.addEventListener("change", () => {
      perbaruiPeran();
      pesan.textContent = "";
    });
  });
  perbaruiPeran();

  tombolMata.addEventListener("click", () => {
    const tampilkan = password.type === "password";
    password.type = tampilkan ? "text" : "password";
    ikonMata.classList.toggle("fa-eye", tampilkan);
    ikonMata.classList.toggle("fa-eye-slash", !tampilkan);
    tombolMata.setAttribute("aria-pressed", String(tampilkan));
    tombolMata.setAttribute("aria-label", tampilkan ? "Sembunyikan kata sandi" : "Tampilkan kata sandi");
  });

  formLogin.addEventListener("input", () => {
    username.setCustomValidity("");
    pesan.textContent = "";
  });

  formLogin.addEventListener("submit", async event => {
  event.preventDefault();

  if (!username.value.trim()) {
    username.setCustomValidity("Isi nama pengguna terlebih dahulu.");
    username.reportValidity();
    return;
  }

  const peran = formLogin.querySelector('input[name="role"]:checked').value;
  tombolMasuk.disabled = true;
  tombolMasuk.textContent = "Memproses...";
  pesan.textContent = "";

  try {
    const response = await fetch(`${API_BASE_URL}/auth/login.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        username: username.value.trim(),
        password: password.value,
        role: peran
      })
    });

    const hasil = await response.json();

    if (!response.ok || hasil.status !== "success") {
      pesan.textContent = hasil.message || "Login gagal. Silakan coba lagi.";
      return;
    }

    const akun = hasil.data?.user;

    if (!akun || !["admin", "kasir"].includes(akun.role)) {
      pesan.textContent = "Respons akun dari server tidak sesuai.";
      return;
    }

    if (akun.must_change_password) {
      pesan.textContent = "Akun wajib mengganti kata sandi awal. Hubungi Admin; fitur ini belum terhubung.";
      return;
    }

    const tujuan = {
      admin: "admin/admin.html",
      kasir: "kasir/kasir.html"
    };

    window.location.replace("loading.html");
  } catch (error) {
    pesan.textContent = "Tidak dapat memproses respons server. Pastikan backend aktif dan coba lagi.";
  } finally {
    tombolMasuk.disabled = false;
    perbaruiPeran();
  }
});

}

// LUPA KATA SANDI
const formPemulihan = document.getElementById("form-pemulihan");

if (formPemulihan) {
  const email = document.getElementById("email-pemulihan");
  const pesan = document.getElementById("pesan-pemulihan");

  email.addEventListener("input", () => {
    pesan.textContent = "";
  });

  formPemulihan.addEventListener("submit", event => {
    event.preventDefault();

    pesan.textContent =
      "Simulasi: jika email terdaftar, tautan pemulihan akan dikirim ke email tersebut. " +
      "Pada versi ini belum ada email yang dikirim.";
  });
}

// UBAH KATA SANDI
const formReset = document.getElementById("form-reset");

if (formReset) {
  const sandi = document.getElementById("sandi-baru");
  const konfirmasi = document.getElementById("konfirmasi-sandi");
  const pesan = document.getElementById("pesan-reset");

  pesan.textContent = "Mode demo: perubahan sandi belum terhubung ke backend.";

  function cocokkanSandi() {
    const berbeda = konfirmasi.value !== "" && sandi.value !== konfirmasi.value;
    konfirmasi.setCustomValidity(berbeda ? "Konfirmasi kata sandi belum sama." : "");
  }

  [sandi, konfirmasi].forEach(input => {
    input.addEventListener("input", () => {
      cocokkanSandi();
      pesan.textContent = "Mode demo: perubahan sandi belum terhubung ke backend.";
    });
  });

  formReset.addEventListener("submit", event => {
    event.preventDefault();
    cocokkanSandi();
    if (!formReset.reportValidity()) return;

    pesan.textContent =
      "Validasi demo berhasil: kedua kata sandi cocok. " +
      "Kata sandi akun belum berubah karena backend belum terhubung.";

  });
}