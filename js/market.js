// Market Prices page functionality
let allPrices = [];

document.addEventListener('DOMContentLoaded', async () => {
    await auth.init();

    // Show report button only if logged in
    const reportBtn = document.getElementById('reportPriceBtn');
    if (reportBtn && auth.isLoggedIn()) {
        reportBtn.style.display = 'inline-flex';
    }

    await loadMarketPrices();
    setupReportForm();
});

// Load market prices from database
async function loadMarketPrices() {
    const tableBody = document.getElementById('pricesTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '<tr><td colspan="4" class="no-prices">Loading prices...</td></tr>';

    try {
        const { data: prices, error } = await supabaseClient
            .from('market_prices')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        allPrices = prices || [];
        renderPrices(allPrices);

    } catch (error) {
        console.error('Error loading market prices:', error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="no-prices">
                    Error loading prices. Please try refreshing the page.
                </td>
            </tr>
        `;
    }
}

// Render prices in table
function renderPrices(prices) {
    const tableBody = document.getElementById('pricesTableBody');
    if (!tableBody) return;

    if (!prices || prices.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="no-prices">
                    No market prices reported yet. Be the first to report!
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = prices.map(price => `
        <tr>
            <td><strong>${escapeHtml(price.crop_name)}</strong></td>
            <td>${escapeHtml(price.district)}</td>
            <td class="price-value">₹${formatPrice(price.price)}</td>
            <td>${formatDate(price.created_at)}</td>
        </tr>
    `).join('');
}

// Filter prices by crop name
function filterPrices() {
    const filterInput = document.getElementById('cropFilter');
    const filterValue = filterInput?.value.toLowerCase().trim() || '';

    if (!filterValue) {
        renderPrices(allPrices);
        return;
    }

    const filtered = allPrices.filter(price =>
        price.crop_name.toLowerCase().includes(filterValue)
    );

    renderPrices(filtered);
}

// Setup report price form
function setupReportForm() {
    const form = document.getElementById('reportPriceForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!auth.isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }

        const cropName = document.getElementById('cropName').value.trim();
        const district = document.getElementById('district').value.trim();
        const price = parseInt(document.getElementById('price').value);

        if (!cropName || !district || !price) {
            showModalMessage('error', 'Please fill in all fields.');
            return;
        }

        setSubmitLoading(true);
        clearModalMessage();

        try {
            const { error } = await supabaseClient
                .from('market_prices')
                .insert({
                    crop_name: cropName,
                    district: district,
                    price: price,
                    reported_by: auth.getUser().id
                });

            if (error) throw error;

            showModalMessage('success', 'Price reported successfully!');

            // Clear form
            form.reset();

            // Reload prices
            await loadMarketPrices();

            // Close modal after delay
            setTimeout(() => {
                closeReportModal();
            }, 1500);

        } catch (error) {
            console.error('Error reporting price:', error);
            showModalMessage('error', error.message || 'Failed to report price. Please try again.');
        } finally {
            setSubmitLoading(false);
        }
    });
}

// Open report modal
function openReportModal() {
    if (!auth.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
    }

    const modal = document.getElementById('reportModal');
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

// Close report modal
function closeReportModal() {
    const modal = document.getElementById('reportModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
        clearModalMessage();
        document.getElementById('reportPriceForm')?.reset();
    }
}

// Close modal when clicking outside
document.addEventListener('click', (e) => {
    const modal = document.getElementById('reportModal');
    if (e.target === modal) {
        closeReportModal();
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeReportModal();
    }
});

// Helper: Show modal message
function showModalMessage(type, message) {
    const messageEl = document.getElementById('modalMessage');
    if (messageEl) {
        messageEl.textContent = message;
        messageEl.className = `form-message ${type}`;
    }
}

// Helper: Clear modal message
function clearModalMessage() {
    const messageEl = document.getElementById('modalMessage');
    if (messageEl) {
        messageEl.textContent = '';
        messageEl.className = 'form-message';
    }
}

// Helper: Set submit loading state
function setSubmitLoading(isLoading) {
    const submitBtn = document.getElementById('submitPriceBtn');
    if (!submitBtn) return;

    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    submitBtn.disabled = isLoading;
    if (btnText) btnText.style.display = isLoading ? 'none' : 'inline';
    if (btnLoading) btnLoading.style.display = isLoading ? 'inline' : 'none';

    // Disable form inputs
    const form = document.getElementById('reportPriceForm');
    if (form) {
        form.querySelectorAll('input').forEach(el => {
            el.disabled = isLoading;
        });
    }
}

// Helper: Format price with commas
function formatPrice(price) {
    return price.toLocaleString('en-IN');
}

// Helper: Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Helper: Escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
