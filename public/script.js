// JavaScript dasar untuk Sistem Informasi Akademik SMA Negeri 12 Pontianak

document.addEventListener('DOMContentLoaded', function() {
  // Konfirmasi sebelum menghapus data
  const deleteButtons = document.querySelectorAll('.btn-danger[data-confirm]');
  
  deleteButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      const message = this.getAttribute('data-confirm') || 'Apakah Anda yakin ingin menghapus data ini?';
      
      if (!confirm(message)) {
        e.preventDefault();
      }
    });
  });

  // Toggle untuk checkbox "Pilih Semua"
  const selectAllCheckbox = document.getElementById('selectAll');
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', function() {
      const checkboxes = document.querySelectorAll('input[name="selectedIds[]"]');
      checkboxes.forEach(checkbox => {
        checkbox.checked = this.checked;
      });
    });
  }

  // Filter data pada halaman
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('keyup', function() {
      const searchTerm = this.value.toLowerCase();
      const rows = document.querySelectorAll('tbody tr');
      
      rows.forEach(row => {
        const rowText = row.textContent.toLowerCase();
        if (rowText.includes(searchTerm)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }

  // Validasi formulir
  const forms = document.querySelectorAll('form[data-validate]');
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      const requiredFields = this.querySelectorAll('[required]');
      let isValid = true;
      
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add('invalid');
        } else {
          field.classList.remove('invalid');
        }
      });
      
      if (!isValid) {
        e.preventDefault();
        alert('Mohon lengkapi semua field yang wajib diisi.');
      }
    });
  });

  // Tampilkan pesan sukses/error jika ada
  const alerts = document.querySelectorAll('.alert');
  alerts.forEach(alert => {
    // Otomatis sembunyikan pesan setelah 5 detik
    setTimeout(() => {
      alert.style.opacity = '0';
      setTimeout(() => {
        alert.style.display = 'none';
      }, 300);
    }, 5000);
  });

  // Fungsi untuk menangani pagination
  const paginationLinks = document.querySelectorAll('.pagination a');
  paginationLinks.forEach(link => {
    link.addEventListener('click', function() {
      // Tambahkan indikator loading
      this.classList.add('loading');
    });
  });
});

// Fungsi utilitas umum
function showNotification(message, type = 'info') {
  const notificationContainer = document.createElement('div');
  notificationContainer.className = `alert alert-${type}`;
  notificationContainer.textContent = message;
  
  // Tambahkan ke halaman
  document.body.insertBefore(notificationContainer, document.body.firstChild);
  
  // Hilangkan setelah beberapa saat
  setTimeout(() => {
    notificationContainer.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(notificationContainer);
    }, 300);
  }, 3000);
}

// Fungsi untuk mengambil data AJAX (jika diperlukan)
async function fetchData(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}