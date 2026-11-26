// Alamat frontend, dihitung dari lokasi file js/auth.js.
const FRONTEND_BASE = new URL("../", document.currentScript.src);
const halaman = document.body.dataset.page;
const peranWajib = document.body.dataset.role;
const tujuanHalaman = { admin: "admin/admin.html", kasir: "kasir/kasir.html" };

function pindahHalaman(path) {
  window.location.replace(new URL(path, FRONTEND_BASE).href);
}

async function periksaSesi() {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(`${API_BASE_URL}/auth/check-session.php`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      signal: controller.signal
    });

    if (response.status === 401) {
      pindahHalaman("login.html");
      return;
    }

    const hasil = await response.json();
    if (!response.ok || hasil.status !== "success") {
      throw new Error(hasil.message || "Sesi belum dapat diperiksa.");
    }

    const akun = hasil.data?.user;
    if (!akun || !Object.hasOwn(tujuanHalaman, akun.role)) {
      throw new Error("Peran akun tidak dikenali.");
    }

    if (akun.must_change_password) {
      throw new Error("Akun wajib mengganti sandi awal. Hubungi Admin; fitur ini belum terhubung.");
    }

    if (halaman === "loading") {
      document.getElementById("loading-status").textContent =
        akun.role === "admin" ? "Admin" : "Kasir";

      // Jeda transisi supaya label peran sempat terlihat.
      const durasi = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 1200;
      await new Promise(resolve => setTimeout(resolve, durasi));
      pindahHalaman(tujuanHalaman[akun.role]);
      return;
    }

    if (peranWajib && akun.role !== peranWajib) {
      throw new Error("Akun ini tidak memiliki akses ke halaman tersebut.");
    }

    document.getElementById("nama-pengguna").textContent = akun.name || akun.username;
    document.getElementById("session-status").hidden = true;
    document.getElementById("workspace").hidden = false;
  } catch (error) {
    const pesan = error.name === "AbortError"
      ? "Server terlalu lama merespons. Periksa koneksi lalu coba lagi."
      : error instanceof SyntaxError
        ? "Respons backend bukan JSON. Pastikan backend sudah diperbarui."
        : error.message || "Tidak dapat menghubungi backend.";

    if (halaman === "loading") {
      document.getElementById("loading-track").hidden = true;
      document.getElementById("loading-status").textContent = "";
      document.getElementById("loading-error-message").textContent = pesan;
      document.getElementById("loading-error").hidden = false;
    } else {
      document.getElementById("session-status").textContent = pesan;
      document.getElementById("session-actions").hidden = false;
    }
  } finally {
    clearTimeout(timeout);
  }
}

document.getElementById("retry-session")?.addEventListener("click", () => location.reload());

if (halaman === "loading" || peranWajib) {
  periksaSesi();
}