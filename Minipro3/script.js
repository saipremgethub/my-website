 
        // Global variables
        let currentUser = null;
        let currentRole = null;
        let cart = [];
        let selectedStaffRating = 0;
        let selectedProductRating = 0;
        let selectedIcon = 'fa-box';
        let editingStockItemId = null;
        
        // Initialize products from localStorage or set defaults
        let products = JSON.parse(localStorage.getItem('products')) || [
            { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 1499.99, stock: 45, icon: 'fa-laptop', description: 'High-performance laptop with latest processor' },
            { id: 2, name: 'Wireless Headphones', category: 'Electronics', price: 99.99, stock: 12, icon: 'fa-headphones', description: 'Noise-cancelling wireless headphones' },
            { id: 3, name: 'Smartphone X', category: 'Electronics', price: 899.99, stock: 0, icon: 'fa-mobile-alt', description: 'Latest smartphone with advanced features' },
            { id: 4, name: 'Cotton T-Shirt', category: 'Clothing', price: 19.99, stock: 78, icon: 'fa-tshirt', description: 'Comfortable 100% cotton t-shirt' },
            { id: 5, name: 'Running Shoes', category: 'Footwear', price: 89.99, stock: 32, icon: 'fa-shoe-prints', description: 'Lightweight running shoes for athletes' },
            { id: 6, name: 'Smart Watch', category: 'Electronics', price: 199.99, stock: 24, icon: 'fa-clock', description: 'Fitness tracking smartwatch' },
            { id: 7, name: 'Digital Camera', category: 'Electronics', price: 549.99, stock: 15, icon: 'fa-camera', description: 'Professional digital camera' },
            { id: 8, name: 'Gaming Console', category: 'Electronics', price: 399.99, stock: 8, icon: 'fa-gamepad', description: 'Next-generation gaming console' }
        ];

        // Initialize staff from localStorage or set defaults
        let staff = JSON.parse(localStorage.getItem('staff')) || [
            { id: 1, name: 'Alex Johnson', username: 'alexj', position: 'Store Manager', status: 'Active', sales: 5240, rating: 4.8, attendance: 98 },
            { id: 2, name: 'Sarah Williams', username: 'sarahw', position: 'Sales Associate', status: 'Active', sales: 3890, rating: 4.2, attendance: 95 },
            { id: 3, name: 'Michael Brown', username: 'michaelb', position: 'Inventory Clerk', status: 'Active', sales: 2150, rating: 3.6, attendance: 92 },
            { id: 4, name: 'Emily Davis', username: 'emilyd', position: 'Cashier', status: 'Inactive', sales: 1890, rating: 4.1, attendance: 97 }
        ];

        // Initialize customers from localStorage or set defaults
        let customers = JSON.parse(localStorage.getItem('customers')) || [];

        // Initialize scheduled orders from localStorage
        let scheduledOrders = JSON.parse(localStorage.getItem('scheduledOrders')) || [];
        let orderIdCounter = parseInt(localStorage.getItem('orderIdCounter')) || 1000;

        // Save products to localStorage
        function saveProducts() {
            localStorage.setItem('products', JSON.stringify(products));
            updateProductCount();
            loadProductsInAllSections();
            loadStockManagement();
        }

        // Save staff to localStorage
        function saveStaff() {
            localStorage.setItem('staff', JSON.stringify(staff));
            loadStaffSettings();
        }

        // Save customers to localStorage
        function saveCustomers() {
            localStorage.setItem('customers', JSON.stringify(customers));
        }

        // Save scheduled orders to localStorage
        function saveScheduledOrders() {
            localStorage.setItem('scheduledOrders', JSON.stringify(scheduledOrders));
            updateScheduledOrdersCount();
            loadScheduledOrdersInAllSections();
            loadCustomerOrders();
            updateTotalSales(); // Update total sales when orders change
            updateStockReports(); // Update stock reports when orders change
        }

        // Update product count in dashboard
        function updateProductCount() {
            document.getElementById('totalProductsCount').textContent = products.length.toLocaleString();
        }

        // Update scheduled orders count in dashboard
        function updateScheduledOrdersCount() {
            const count = scheduledOrders.length;
            document.getElementById('scheduledOrdersCount').textContent = count;
            document.getElementById('staffScheduledOrdersCount').textContent = count;
            document.getElementById('customerScheduledOrdersCount').textContent = count;
        }

        // Update total sales in dashboard
        function updateTotalSales() {
            const completedOrders = scheduledOrders.filter(order => order.status === 'Completed');
            const totalSales = completedOrders.reduce((sum, order) => sum + order.total, 0);
            document.getElementById('totalSalesValue').textContent = `₹${totalSales.toLocaleString()}`;
            
            // Update sales reports
            updateSalesReports();
        }

        // Update stock reports
        function updateStockReports() {
            // Update inventory status table
            const inventoryTable = document.getElementById('inventoryStatusTable');
            if (inventoryTable) {
                inventoryTable.innerHTML = '';
                
                products.forEach(item => {
                    const row = document.createElement('tr');
                    let statusClass, statusText;
                    
                    if (item.stock > 10) {
                        statusClass = 'badge-success';
                        statusText = 'In Stock';
                    } else if (item.stock > 0) {
                        statusClass = 'badge-warning';
                        statusText = 'Low Stock';
                    } else {
                        statusClass = 'badge-danger';
                        statusText = 'Out of Stock';
                    }
                    
                    row.innerHTML = `
                        <td>${item.name}</td>
                        <td>${item.category}</td>
                        <td>${item.stock}</td>
                        <td><span class="badge ${statusClass}">${statusText}</span></td>
                    `;
                    inventoryTable.appendChild(row);
                });
            }
            
            // Update staff inventory table
            const staffInventoryTable = document.getElementById('staffInventoryTable');
            if (staffInventoryTable) {
                staffInventoryTable.innerHTML = '';
                
                products.forEach(item => {
                    const row = document.createElement('tr');
                    let statusClass, statusText;
                    
                    if (item.stock > 10) {
                        statusClass = 'badge-success';
                        statusText = 'In Stock';
                    } else if (item.stock > 0) {
                        statusClass = 'badge-warning';
                        statusText = 'Low Stock';
                    } else {
                        statusClass = 'badge-danger';
                        statusText = 'Out of Stock';
                    }
                    
                    row.innerHTML = `
                        <td>${item.name}</td>
                        <td>${item.category}</td>
                        <td>${item.stock}</td>
                        <td><span class="badge ${statusClass}">${statusText}</span></td>
                        <td>
                            <button class="btn btn-small">Update</button>
                        </td>
                    `;
                    staffInventoryTable.appendChild(row);
                });
            }
            
            // Update stock charts
            updateStockCharts();
        }

        // Update stock charts
        function updateStockCharts() {
            // Update admin stock chart
            const adminStockChart = document.getElementById('adminStockChart');
            if (adminStockChart) {
                // Calculate stock by category
                const stockByCategory = {};
                products.forEach(item => {
                    if (!stockByCategory[item.category]) {
                        stockByCategory[item.category] = 0;
                    }
                    stockByCategory[item.category] += item.stock;
                });
                
                // Destroy existing chart if it exists
                const existingChart = Chart.getChart(adminStockChart);
                if (existingChart) {
                    existingChart.destroy();
                }
                
                // Create new chart
                new Chart(adminStockChart.getContext('2d'), {
                    type: 'doughnut',
                    data: {
                        labels: Object.keys(stockByCategory),
                        datasets: [{
                            data: Object.values(stockByCategory),
                            backgroundColor: [
                                'rgba(79, 70, 229, 0.8)',
                                'rgba(16, 185, 129, 0.8)',
                                'rgba(245, 158, 11, 0.8)',
                                'rgba(139, 92, 246, 0.8)',
                                'rgba(107, 114, 128, 0.8)'
                            ],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'right'
                            }
                        }
                    }
                });
            }
            
            // Update staff stock chart
            const staffStockChart = document.getElementById('staffStockChart');
            if (staffStockChart) {
                // Calculate stock by category
                const stockByCategory = {};
                products.forEach(item => {
                    if (!stockByCategory[item.category]) {
                        stockByCategory[item.category] = 0;
                    }
                    stockByCategory[item.category] += item.stock;
                });
                
                // Destroy existing chart if it exists
                const existingChart = Chart.getChart(staffStockChart);
                if (existingChart) {
                    existingChart.destroy();
                }
                
                // Create new chart
                new Chart(staffStockChart.getContext('2d'), {
                    type: 'pie',
                    data: {
                        labels: Object.keys(stockByCategory),
                        datasets: [{
                            data: Object.values(stockByCategory),
                            backgroundColor: [
                                'rgba(79, 70, 229, 0.8)',
                                'rgba(16, 185, 129, 0.8)',
                                'rgba(245, 158, 11, 0.8)',
                                'rgba(139, 92, 246, 0.8)',
                                'rgba(107, 114, 128, 0.8)'
                            ],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'right'
                            }
                        }
                    }
                });
            }
            
            // Update admin stock report chart
            const adminStockReportChart = document.getElementById('adminStockReportChart');
            if (adminStockReportChart) {
                // Count products by stock status
                const inStock = products.filter(p => p.stock > 10).length;
                const lowStock = products.filter(p => p.stock > 0 && p.stock <= 10).length;
                const outOfStock = products.filter(p => p.stock === 0).length;
                
                // Destroy existing chart if it exists
                const existingChart = Chart.getChart(adminStockReportChart);
                if (existingChart) {
                    existingChart.destroy();
                }
                
                // Create new chart
                new Chart(adminStockReportChart.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: ['In Stock', 'Low Stock', 'Out of Stock'],
                        datasets: [{
                            label: 'Products',
                            data: [inStock, lowStock, outOfStock],
                            backgroundColor: [
                                'rgba(16, 185, 129, 0.8)',
                                'rgba(245, 158, 11, 0.8)',
                                'rgba(239, 68, 68, 0.8)'
                            ],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
        }

        // Update sales reports
        function updateSalesReports() {
            // Update recent sales table
            const recentSalesTable = document.getElementById('recentSalesTable');
            if (recentSalesTable) {
                recentSalesTable.innerHTML = '';
                
                // Get completed orders for sales reports
                const completedOrders = scheduledOrders.filter(order => order.status === 'Completed');
                const recentSales = completedOrders.slice(0, 5);
                
                recentSales.forEach(order => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>#${order.id}</td>
                        <td>${order.customer}</td>
                        <td>${new Date(order.orderDate).toLocaleDateString()}</td>
                        <td>₹${order.total.toFixed(2)}</td>
                        <td><span class="badge ${getStatusBadgeClass(order.status)}">${order.status}</span></td>
                    `;
                    recentSalesTable.appendChild(row);
                });
            }
            
            // Update admin sales chart
            const adminSalesChart = document.getElementById('adminSalesChart');
            if (adminSalesChart) {
                // Calculate monthly sales from completed orders
                const completedOrders = scheduledOrders.filter(order => order.status === 'Completed');
                const monthlySales = [0, 0, 0, 0, 0]; // Jan to May
                
                completedOrders.forEach(order => {
                    const orderDate = new Date(order.orderDate);
                    const month = orderDate.getMonth(); // 0 = Jan, 1 = Feb, etc.
                    if (month >= 0 && month < 5) {
                        monthlySales[month] += order.total;
                    }
                });
                
                // Destroy existing chart if it exists
                const existingChart = Chart.getChart(adminSalesChart);
                if (existingChart) {
                    existingChart.destroy();
                }
                
                // Create new chart
                new Chart(adminSalesChart.getContext('2d'), {
                    type: 'line',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                        datasets: [{
                            label: 'Sales',
                            data: monthlySales,
                            backgroundColor: 'rgba(79, 70, 229, 0.2)',
                            borderColor: 'rgba(79, 70, 229, 1)',
                            borderWidth: 2,
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) {
                                        return '₹' + value.toLocaleString();
                                    }
                                }
                            }
                        }
                    }
                });
            }
            
            // Update admin sales report chart
            const adminSalesReportChart = document.getElementById('adminSalesReportChart');
            if (adminSalesReportChart) {
                // Calculate sales by category
                const salesByCategory = {};
                const completedOrders = scheduledOrders.filter(order => order.status === 'Completed');
                
                completedOrders.forEach(order => {
                    order.items.forEach(item => {
                        const product = products.find(p => p.name === item.name);
                        if (product) {
                            if (!salesByCategory[product.category]) {
                                salesByCategory[product.category] = 0;
                            }
                            salesByCategory[product.category] += item.price * item.quantity;
                        }
                    });
                });
                
                // Destroy existing chart if it exists
                const existingChart = Chart.getChart(adminSalesReportChart);
                if (existingChart) {
                    existingChart.destroy();
                }
                
                // Create new chart
                new Chart(adminSalesReportChart.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: Object.keys(salesByCategory),
                        datasets: [{
                            label: 'Sales',
                            data: Object.values(salesByCategory),
                            backgroundColor: 'rgba(79, 70, 229, 0.8)',
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) {
                                        return '₹' + value.toLocaleString();
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }

        // Update staff reports
        function updateStaffReports() {
            // Update staff table
            const staffTableBody = document.getElementById('staffTableBody');
            if (staffTableBody) {
                staffTableBody.innerHTML = '';
                
                staff.forEach(staffMember => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${staffMember.name}</td>
                        <td>${staffMember.position}</td>
                        <td>₹${staffMember.sales.toLocaleString()}</td>
                        <td>
                            <div class="stars">
                                ${generateStars(staffMember.rating)}
                            </div>
                        </td>
                        <td>${staffMember.attendance}%</td>
                    `;
                    staffTableBody.appendChild(row);
                });
            }
            
            // Update staff chart
            const adminStaffChart = document.getElementById('adminStaffChart');
            if (adminStaffChart) {
                // Generate performance data for each staff member
                const staffData = staff.map(staffMember => {
                    return {
                        name: staffMember.name,
                        data: [
                            Math.min(100, staffMember.sales / 100), // Sales performance (normalized)
                            staffMember.rating * 20, // Rating (converted to 0-100 scale)
                            Math.floor(Math.random() * 30 + 70), // Product Knowledge
                            Math.floor(Math.random() * 30 + 70), // Teamwork
                            staffMember.attendance // Punctuality
                        ]
                    };
                });
                
                // Destroy existing chart if it exists
                const existingChart = Chart.getChart(adminStaffChart);
                if (existingChart) {
                    existingChart.destroy();
                }
                
                // Create new chart
                new Chart(adminStaffChart.getContext('2d'), {
                    type: 'radar',
                    data: {
                        labels: ['Sales', 'Customer Service', 'Product Knowledge', 'Teamwork', 'Punctuality'],
                        datasets: staffData.map((staff, index) => ({
                            label: staff.name,
                            data: staff.data,
                            backgroundColor: `rgba(${79 + index * 40}, ${70 + index * 30}, ${229 - index * 30}, 0.2)`,
                            borderColor: `rgba(${79 + index * 40}, ${70 + index * 30}, ${229 - index * 30}, 0.8)`,
                            borderWidth: 2
                        }))
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            r: {
                                beginAtZero: true,
                                max: 100
                            }
                        }
                    }
                });
            }
        }

        // Helper function to generate star ratings
        function generateStars(rating) {
            let stars = '';
            const fullStars = Math.floor(rating);
            const hasHalfStar = rating % 1 >= 0.5;
            
            for (let i = 0; i < fullStars; i++) {
                stars += '<i class="fas fa-star"></i>';
            }
            
            if (hasHalfStar) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            }
            
            const emptyStars = 5 - Math.ceil(rating);
            for (let i = 0; i < emptyStars; i++) {
                stars += '<i class="far fa-star"></i>';
            }
            
            return stars;
        }

        // Initialize charts
        document.addEventListener('DOMContentLoaded', function() {
            initializeCharts();
            setupRatingInputs();
            setupIconSelector();
            setupAddItemForm();
            setupStockItemForms();
            updateProductCount();
            updateScheduledOrdersCount();
            updateTotalSales();
            updateStockReports();
            updateStaffReports();
            loadProductsInAllSections();
            loadStockManagement();
            loadScheduledOrdersInAllSections();
            loadCart();
            loadStaffSettings();
        });

        // Login functions
        function showLoginForm(role) {
            document.getElementById('adminLoginForm').classList.remove('active');
            document.getElementById('staffLoginForm').classList.remove('active');
            document.getElementById('customerLoginForm').classList.remove('active');
            document.getElementById('customerRegisterForm').classList.remove('active');
            
            if (role === 'admin') {
                document.getElementById('adminLoginForm').classList.add('active');
            } else if (role === 'staff') {
                document.getElementById('staffLoginForm').classList.add('active');
            } else if (role === 'customer') {
                document.getElementById('customerLoginForm').classList.add('active');
            }
        }

        function backToRoleSelection() {
            document.getElementById('adminLoginForm').classList.remove('active');
            document.getElementById('staffLoginForm').classList.remove('active');
            document.getElementById('customerLoginForm').classList.remove('active');
            document.getElementById('customerRegisterForm').classList.remove('active');
        }

        function showCustomerRegister() {
            document.getElementById('customerLoginForm').classList.remove('active');
            document.getElementById('customerRegisterForm').classList.add('active');
        }

        function backToCustomerLogin() {
            document.getElementById('customerRegisterForm').classList.remove('active');
            document.getElementById('customerLoginForm').classList.add('active');
        }

        function login(role) {
            let username, password;
            
            if (role === 'admin') {
                username = document.getElementById('adminUsername').value;
                password = document.getElementById('adminPassword').value;
                
                if (username === 'admin' && password === 'admin') {
                    currentRole = 'admin';
                    currentUser = { name: 'Admin', username: 'admin' };
                    showDashboard('admin');
                } else {
                    alert('Invalid credentials for admin');
                }
            } else if (role === 'staff') {
                username = document.getElementById('staffUsername').value;
                password = document.getElementById('staffPassword').value;
                
                if (username === 'staff' && password === 'staff') {
                    currentRole = 'staff';
                    currentUser = { name: 'Staff', username: 'staff' };
                    showDashboard('staff');
                } else {
                    alert('Invalid credentials for staff');
                }
            } else if (role === 'customer') {
                username = document.getElementById('customerUsername').value;
                password = document.getElementById('customerPassword').value;
                
                // Check if customer exists and password matches
                const customer = customers.find(c => c.username === username && c.password === password);
                
                if (customer) {
                    currentRole = 'customer';
                    currentUser = customer;
                    showDashboard('customer');
                    updateCustomerDashboard();
                } else {
                    alert('Invalid username or password. Please register first.');
                }
            }
        }

        function registerCustomer() {
            const name = document.getElementById('regCustomerName').value;
            const username = document.getElementById('regCustomerUsername').value;
            const email = document.getElementById('regCustomerEmail').value;
            const password = document.getElementById('regCustomerPassword').value;
            
            if (name && username && email && password) {
                // Check if username already exists
                if (customers.find(c => c.username === username)) {
                    alert('Username already exists. Please choose a different username.');
                    return;
                }
                
                const newCustomer = {
                    id: Date.now(),
                    name,
                    username,
                    email,
                    password,
                    registeredDate: new Date().toISOString()
                };
                
                customers.push(newCustomer);
                saveCustomers();
                
                alert('Registration successful! Please login with your credentials.');
                backToCustomerLogin();
            } else {
                alert('Please fill all fields');
            }
        }

        function logout() {
            currentRole = null;
            currentUser = null;
            cart = [];
            document.getElementById('loginPage').style.display = 'flex';
            document.getElementById('adminDashboard').classList.remove('active');
            document.getElementById('staffDashboard').classList.remove('active');
            document.getElementById('customerDashboard').classList.remove('active');
        }

        function showDashboard(role) {
            document.getElementById('loginPage').style.display = 'none';
            
            if (role === 'admin') {
                document.getElementById('adminDashboard').classList.add('active');
                document.getElementById('staffDashboard').classList.remove('active');
                document.getElementById('customerDashboard').classList.remove('active');
            } else if (role === 'staff') {
                document.getElementById('adminDashboard').classList.remove('active');
                document.getElementById('staffDashboard').classList.add('active');
                document.getElementById('customerDashboard').classList.remove('active');
            } else if (role === 'customer') {
                document.getElementById('adminDashboard').classList.remove('active');
                document.getElementById('staffDashboard').classList.remove('active');
                document.getElementById('customerDashboard').classList.add('active');
            }
        }

        function updateCustomerDashboard() {
            // Update welcome message and avatar
            document.getElementById('customerWelcome').textContent = `Welcome, ${currentUser.name}`;
            document.getElementById('customerAvatar').textContent = currentUser.name.charAt(0).toUpperCase();
            
            // Update customer orders count
            const customerOrders = scheduledOrders.filter(order => order.customer === currentUser.username);
            document.getElementById('customerTotalOrders').textContent = customerOrders.length;
            
            // Load customer orders
            loadCustomerOrders();
        }

        // Admin dashboard functions
        function showAdminSection(section) {
            // Update sidebar active state
            const sidebarLinks = document.querySelectorAll('#adminDashboard .sidebar-menu a');
            sidebarLinks.forEach(link => link.classList.remove('active'));
            event.target.classList.add('active');
            
            // Hide all sections
            const sections = document.querySelectorAll('#adminDashboard .tab-content');
            sections.forEach(sec => sec.classList.remove('active'));
            
            // Show selected section
            document.getElementById('admin' + section.charAt(0).toUpperCase() + section.slice(1) + 'Section').classList.add('active');
            
            // Load content in relevant sections
            if (section === 'addItems') {
                loadRecentlyAddedItems();
            } else if (section === 'stock') {
                updateStockReports();
            } else if (section === 'stockManagement') {
                loadStockManagement();
            } else if (section === 'scheduledOrders') {
                loadScheduledOrders();
            } else if (section === 'sales') {
                updateSalesReports();
            } else if (section === 'staff') {
                updateStaffReports();
            } else if (section === 'topItems') {
                setTimeout(() => {
                    if (document.getElementById('adminTopItemsChart')) {
                        initializeAdminTopItemsChart();
                    }
                }, 100);
            }
        }

        function showSettingsTab(tab) {
            // Update tab active state
            const tabs = document.querySelectorAll('#adminSettingsSection .tab');
            tabs.forEach(t => t.classList.remove('active'));
            event.target.classList.add('active');
            
            // Hide all tab contents
            const tabContents = document.querySelectorAll('#adminSettingsSection .tab-content');
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Show selected tab content
            document.getElementById(tab + 'SettingsTab').classList.add('active');
            
            // Load staff data when users tab is shown
            if (tab === 'users') {
                loadStaffSettings();
            }
        }

        function saveSettings() {
            alert('Settings saved successfully!');
        }

        function registerStaff() {
            const name = document.getElementById('staffName').value;
            const username = document.getElementById('staffUsername').value;
            const email = document.getElementById('staffEmail').value;
            const position = document.getElementById('staffPosition').value;
            const password = document.getElementById('staffPassword').value;
            
            if (name && username && email && position && password) {
                const newStaff = {
                    id: Date.now(),
                    name,
                    username,
                    position,
                    status: 'Active',
                    sales: 0,
                    rating: 0,
                    attendance: 0
                };
                
                staff.push(newStaff);
                saveStaff();
                
                alert('Staff registered successfully!');
                closeModal('registerStaffModal');
                
                // Clear form
                document.getElementById('staffName').value = '';
                document.getElementById('staffUsername').value = '';
                document.getElementById('staffEmail').value = '';
                document.getElementById('staffPosition').value = '';
                document.getElementById('staffPassword').value = '';
            } else {
                alert('Please fill all fields');
            }
        }

        function editStaff(staffId) {
            const staffMember = staff.find(s => s.id === staffId);
            if (!staffMember) return;
            
            document.getElementById('editStaffId').value = staffMember.id;
            document.getElementById('editStaffName').value = staffMember.name;
            document.getElementById('editStaffUsername').value = staffMember.username;
            document.getElementById('editStaffPosition').value = staffMember.position;
            
            openModal('editStaffModal');
        }

        function updateStaff() {
            const id = parseInt(document.getElementById('editStaffId').value);
            const name = document.getElementById('editStaffName').value;
            const username = document.getElementById('editStaffUsername').value;
            const position = document.getElementById('editStaffPosition').value;
            
            if (name && username && position) {
                const staffIndex = staff.findIndex(s => s.id === id);
                if (staffIndex !== -1) {
                    staff[staffIndex] = {
                        ...staff[staffIndex],
                        name,
                        username,
                        position
                    };
                    
                    saveStaff();
                    alert('Staff updated successfully!');
                    closeModal('editStaffModal');
                }
            } else {
                alert('Please fill all fields');
            }
        }

        function toggleStaffStatus(staffId) {
            const staffIndex = staff.findIndex(s => s.id === staffId);
            if (staffIndex !== -1) {
                staff[staffIndex].status = staff[staffIndex].status === 'Active' ? 'Inactive' : 'Active';
                saveStaff();
            }
        }

        function loadStaffSettings() {
            const staffTableBody = document.getElementById('staffTableBodySettings');
            staffTableBody.innerHTML = '';
            
            staff.forEach(staffMember => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${staffMember.name}</td>
                    <td>${staffMember.username}</td>
                    <td>${staffMember.position}</td>
                    <td><span class="badge ${staffMember.status === 'Active' ? 'badge-success' : 'badge-danger'}">${staffMember.status}</span></td>
                    <td>
                        <button class="btn btn-small" onclick="editStaff(${staffMember.id})">Edit</button>
                        <button class="btn btn-small ${staffMember.status === 'Active' ? 'btn-secondary' : ''}" onclick="toggleStaffStatus(${staffMember.id})">
                            ${staffMember.status === 'Active' ? 'Disable' : 'Enable'}
                        </button>
                    </td>
                `;
                staffTableBody.appendChild(row);
            });
        }

        // Add Item functionality
        function setupIconSelector() {
            const iconSelectors = document.querySelectorAll('.icon-selector');
            iconSelectors.forEach(selector => {
                const iconOptions = selector.querySelectorAll('.icon-option');
                iconOptions.forEach(option => {
                    option.addEventListener('click', function(e) {
                        e.preventDefault();
                        iconOptions.forEach(opt => opt.classList.remove('selected'));
                        this.classList.add('selected');
                        selectedIcon = this.getAttribute('data-icon');
                    });
                });
                
                // Set first icon as selected by default
                if (iconOptions.length > 0) {
                    iconOptions[0].classList.add('selected');
                }
            });
        }

        function setupAddItemForm() {
            const addItemForm = document.getElementById('addItemForm');
            addItemForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const name = document.getElementById('itemName').value;
                const category = document.getElementById('itemCategory').value;
                const price = parseFloat(document.getElementById('itemPrice').value);
                const stock = parseInt(document.getElementById('itemStock').value);
                const description = document.getElementById('itemDescription').value;
                
                const newItem = {
                    id: Date.now(),
                    name,
                    category,
                    price,
                    stock,
                    description,
                    icon: selectedIcon,
                    dateAdded: new Date().toISOString()
                };
                
                products.push(newItem);
                saveProducts();
                
                // Show success message
                alert(`Item "${name}" has been added successfully!`);
                
                // Reset form
                resetAddItemForm();
                
                // Load recently added items
                loadRecentlyAddedItems();
            });
        }

        function resetAddItemForm() {
            document.getElementById('addItemForm').reset();
            
            // Reset icon selection
            const iconOptions = document.querySelectorAll('#iconSelector .icon-option');
            iconOptions.forEach(opt => opt.classList.remove('selected'));
            if (iconOptions.length > 0) {
                iconOptions[0].classList.add('selected');
                selectedIcon = 'fa-laptop';
            }
        }

        function loadRecentlyAddedItems() {
            const recentlyAddedGrid = document.getElementById('recentlyAddedGrid');
            recentlyAddedGrid.innerHTML = '';
            
            // Get last 4 added items
            const recentItems = [...products].reverse().slice(0, 4);
            
            recentItems.forEach(item => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                productCard.innerHTML = `
                    <div class="product-image">
                        <i class="fas ${item.icon} fa-3x"></i>
                    </div>
                    <div class="product-info">
                        <h3 class="product-name">${item.name}</h3>
                        <div class="product-price">₹${item.price.toFixed(2)}</div>
                        <div class="product-stock">In Stock: ${item.stock}</div>
                        <div class="product-category">${item.category}</div>
                    </div>
                `;
                recentlyAddedGrid.appendChild(productCard);
            });
        }

        // Stock Management functions
        function setupStockItemForms() {
            // Add Stock Item Form
            const addStockItemForm = document.getElementById('addStockItemForm');
            addStockItemForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const name = document.getElementById('stockItemName').value;
                const category = document.getElementById('stockItemCategory').value;
                const price = parseFloat(document.getElementById('stockItemPrice').value);
                const quantity = parseInt(document.getElementById('stockItemQuantity').value);
                const description = document.getElementById('stockItemDescription').value;
                
                const newItem = {
                    id: Date.now(),
                    name,
                    category,
                    price,
                    stock: quantity,
                    description,
                    icon: selectedIcon,
                    dateAdded: new Date().toISOString()
                };
                
                products.push(newItem);
                saveProducts();
                
                alert(`Item "${name}" has been added successfully!`);
                closeModal('addStockItemModal');
                resetAddStockItemForm();
            });
            
            // Edit Stock Item Form
            const editStockItemForm = document.getElementById('editStockItemForm');
            editStockItemForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const id = parseInt(document.getElementById('editStockItemId').value);
                const name = document.getElementById('editStockItemName').value;
                const category = document.getElementById('editStockItemCategory').value;
                const price = parseFloat(document.getElementById('editStockItemPrice').value);
                const quantity = parseInt(document.getElementById('editStockItemQuantity').value);
                const description = document.getElementById('editStockItemDescription').value;
                
                const itemIndex = products.findIndex(item => item.id === id);
                if (itemIndex !== -1) {
                    products[itemIndex] = {
                        ...products[itemIndex],
                        name,
                        category,
                        price,
                        stock: quantity,
                        description,
                        icon: selectedIcon
                    };
                    
                    saveProducts();
                    alert(`Item "${name}" has been updated successfully!`);
                    closeModal('editStockItemModal');
                }
            });
        }

        function resetAddStockItemForm() {
            document.getElementById('addStockItemForm').reset();
            
            // Reset icon selection
            const iconOptions = document.querySelectorAll('#stockIconSelector .icon-option');
            iconOptions.forEach(opt => opt.classList.remove('selected'));
            if (iconOptions.length > 0) {
                iconOptions[0].classList.add('selected');
                selectedIcon = 'fa-laptop';
            }
        }

        function loadStockManagement() {
            const stockManagementGrid = document.getElementById('stockManagementGrid');
            const staffStockManagementGrid = document.getElementById('staffStockManagementGrid');
            
            if (stockManagementGrid) {
                stockManagementGrid.innerHTML = '';
            }
            if (staffStockManagementGrid) {
                staffStockManagementGrid.innerHTML = '';
            }
            
            products.forEach(item => {
                const stockItem = document.createElement('div');
                stockItem.className = 'stock-item';
                stockItem.innerHTML = `
                    <div class="stock-item-header">
                        <div class="stock-item-info">
                            <h4>${item.name}</h4>
                            <p>${item.category} - ₹${item.price.toFixed(2)}</p>
                        </div>
                        <div class="stock-item-controls">
                            <button class="btn btn-small" onclick="editStockItem(${item.id})">Edit</button>
                            <button class="btn btn-small btn-secondary" onclick="deleteStockItem(${item.id})">Delete</button>
                        </div>
                    </div>
                    <div class="stock-item-info">
                        <p><strong>Stock:</strong> ${item.stock}</p>
                        <p><strong>Description:</strong> ${item.description}</p>
                    </div>
                    <div class="stock-adjust">
                        <label>Adjust Stock:</label>
                        <div class="stock-controls">
                            <input type="number" id="adjust-${item.id}" placeholder="Quantity" min="1">
                            <button class="btn btn-small" onclick="addStock(${item.id})">Add</button>
                            <button class="btn btn-small btn-secondary" onclick="subtractStock(${item.id})">Subtract</button>
                        </div>
                    </div>
                `;
                
                if (stockManagementGrid) {
                    stockManagementGrid.appendChild(stockItem.cloneNode(true));
                }
                if (staffStockManagementGrid) {
                    staffStockManagementGrid.appendChild(stockItem);
                }
            });
        }

        function editStockItem(id) {
            const item = products.find(p => p.id === id);
            if (item) {
                editingStockItemId = id;
                document.getElementById('editStockItemId').value = id;
                document.getElementById('editStockItemName').value = item.name;
                document.getElementById('editStockItemCategory').value = item.category;
                document.getElementById('editStockItemPrice').value = item.price;
                document.getElementById('editStockItemQuantity').value = item.stock;
                document.getElementById('editStockItemDescription').value = item.description;
                
                // Set icon selection
                const iconOptions = document.querySelectorAll('#editStockIconSelector .icon-option');
                iconOptions.forEach(opt => opt.classList.remove('selected'));
                const selectedIconOption = document.querySelector(`#editStockIconSelector .icon-option[data-icon="${item.icon}"]`);
                if (selectedIconOption) {
                    selectedIconOption.classList.add('selected');
                    selectedIcon = item.icon;
                }
                
                openModal('editStockItemModal');
            }
        }

        function deleteStockItem(id) {
            if (confirm('Are you sure you want to delete this item?')) {
                products = products.filter(item => item.id !== id);
                saveProducts();
                alert('Item has been deleted successfully!');
            }
        }

        function addStock(id) {
            const quantityInput = document.getElementById(`adjust-${id}`);
            const quantity = parseInt(quantityInput.value);
            
            if (quantity && quantity > 0) {
                const itemIndex = products.findIndex(item => item.id === id);
                if (itemIndex !== -1) {
                    products[itemIndex].stock += quantity;
                    saveProducts();
                    updateStockReports();
                    quantityInput.value = '';
                    alert(`Stock has been increased by ${quantity} units!`);
                }
            } else {
                alert('Please enter a valid quantity!');
            }
        }

        function subtractStock(id) {
            const quantityInput = document.getElementById(`adjust-${id}`);
            const quantity = parseInt(quantityInput.value);
            
            if (quantity && quantity > 0) {
                const itemIndex = products.findIndex(item => item.id === id);
                if (itemIndex !== -1) {
                    if (products[itemIndex].stock >= quantity) {
                        products[itemIndex].stock -= quantity;
                        saveProducts();
                        updateStockReports();
                        quantityInput.value = '';
                        alert(`Stock has been decreased by ${quantity} units!`);
                    } else {
                        alert('Not enough stock available!');
                    }
                }
            } else {
                alert('Please enter a valid quantity!');
            }
        }

        // Scheduled Orders functions
        function loadScheduledOrders() {
            const scheduledOrdersTable = document.getElementById('scheduledOrdersTable');
            scheduledOrdersTable.innerHTML = '';
            
            scheduledOrders.forEach(order => {
                const row = document.createElement('tr');
                let actions = `
                    <button class="btn btn-small" onclick="viewOrderDetails(${order.id})">View</button>
                `;
                
                if (order.status === 'Pending') {
                    actions += `<button class="btn btn-small btn-secondary" onclick="updateOrderStatus(${order.id}, 'Processing')">Process</button>`;
                } else if (order.status === 'Processing') {
                    actions += `<button class="btn btn-small btn-secondary" onclick="updateOrderStatus(${order.id}, 'Completed')">Complete</button>`;
                }
                
                row.innerHTML = `
                    <td>#${order.id}</td>
                    <td>${order.customer}</td>
                    <td>${order.items.length} items</td>
                    <td>₹${order.total.toFixed(2)}</td>
                    <td>${order.scheduledDate} at ${order.scheduledTime}</td>
                    <td><span class="badge ${getStatusBadgeClass(order.status)}">${order.status}</span></td>
                    <td>${actions}</td>
                `;
                scheduledOrdersTable.appendChild(row);
            });
        }

        function loadScheduledOrdersInAllSections() {
            // Admin
            if (document.getElementById('scheduledOrdersTable')) {
                loadScheduledOrders();
            }
            
            // Staff
            if (document.getElementById('staffScheduledOrdersTable')) {
                const staffScheduledOrdersTable = document.getElementById('staffScheduledOrdersTable');
                staffScheduledOrdersTable.innerHTML = '';
                
                scheduledOrders.forEach(order => {
                    const row = document.createElement('tr');
                    let actions = `
                        <button class="btn btn-small" onclick="viewOrderDetails(${order.id})">View</button>
                    `;
                    
                    if (order.status === 'Pending') {
                        actions += `<button class="btn btn-small btn-secondary" onclick="updateOrderStatus(${order.id}, 'Processing')">Process</button>`;
                    } else if (order.status === 'Processing') {
                        actions += `<button class="btn btn-small btn-secondary" onclick="updateOrderStatus(${order.id}, 'Completed')">Complete</button>`;
                    }
                    
                    row.innerHTML = `
                        <td>#${order.id}</td>
                        <td>${order.customer}</td>
                        <td>${order.items.length} items</td>
                        <td>₹${order.total.toFixed(2)}</td>
                        <td>${order.scheduledDate} at ${order.scheduledTime}</td>
                        <td><span class="badge ${getStatusBadgeClass(order.status)}">${order.status}</span></td>
                        <td>${actions}</td>
                    `;
                    staffScheduledOrdersTable.appendChild(row);
                });
            }
            
            // Customer
            if (document.getElementById('customerScheduledOrdersTable')) {
                const customerScheduledOrdersTable = document.getElementById('customerScheduledOrdersTable');
                customerScheduledOrdersTable.innerHTML = '';
                
                const customerOrders = scheduledOrders.filter(order => order.customer === currentUser.username);
                customerOrders.forEach(order => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>#${order.id}</td>
                        <td>${order.items.length} items</td>
                        <td>₹${order.total.toFixed(2)}</td>
                        <td>${order.scheduledDate} at ${order.scheduledTime}</td>
                        <td><span class="badge ${getStatusBadgeClass(order.status)}">${order.status}</span></td>
                        <td>
                            <button class="btn btn-small" onclick="viewOrderDetails(${order.id})">View</button>
                            ${order.status === 'Pending' ? `<button class="btn btn-small btn-secondary" onclick="cancelOrder(${order.id})">Cancel</button>` : ''}
                        </td>
                    `;
                    customerScheduledOrdersTable.appendChild(row);
                });
            }
        }

        function getStatusBadgeClass(status) {
            switch (status) {
                case 'Pending': return 'badge-warning';
                case 'Processing': return 'badge-info';
                case 'Completed': return 'badge-success';
                case 'Cancelled': return 'badge-danger';
                default: return 'badge-secondary';
            }
        }

        function viewOrderDetails(orderId) {
            const order = scheduledOrders.find(o => o.id === orderId);
            if (!order) return;
            
            let itemsList = '';
            order.items.forEach(item => {
                itemsList += `
                    <tr>
                        <td>${item.name}</td>
                        <td>₹${item.price.toFixed(2)}</td>
                        <td>${item.quantity}</td>
                        <td>₹${(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                `;
            });
            
            const orderDetailsContent = document.getElementById('orderDetailsContent');
            orderDetailsContent.innerHTML = `
                <div class="bill-info">
                    <div class="form-group">
                        <label>Order ID</label>
                        <input type="text" value="#${order.id}" readonly>
                    </div>
                    <div class="form-group">
                        <label>Order Date</label>
                        <input type="text" value="${new Date(order.orderDate).toLocaleDateString()}" readonly>
                    </div>
                    <div class="form-group">
                        <label>Customer</label>
                        <input type="text" value="${order.customer}" readonly>
                    </div>
                    <div class="form-group">
                        <label>Status</label>
                        <input type="text" value="${order.status}" readonly>
                    </div>
                </div>
                
                <div class="bill-items">
                    <h3>Order Items</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsList}
                        </tbody>
                    </table>
                </div>
                
                <div class="bill-info">
                    <div class="form-group">
                        <label>Scheduled Pickup</label>
                        <input type="text" value="${order.scheduledDate} at ${order.scheduledTime}" readonly>
                    </div>
                    <div class="form-group">
                        <label>Special Instructions</label>
                        <textarea readonly>${order.specialInstructions || 'None'}</textarea>
                    </div>
                </div>
                
                <div class="bill-total">
                    <span>Total:</span>
                    <span>₹${order.total.toFixed(2)}</span>
                </div>
            `;
            
            openModal('orderDetailsModal');
        }

        function updateOrderStatus(orderId, newStatus) {
            const orderIndex = scheduledOrders.findIndex(o => o.id === orderId);
            if (orderIndex !== -1) {
                scheduledOrders[orderIndex].status = newStatus;
                
                // If order is completed, reduce stock
                if (newStatus === 'Completed') {
                    scheduledOrders[orderIndex].items.forEach(orderItem => {
                        const productIndex = products.findIndex(p => p.name === orderItem.name);
                        if (productIndex !== -1) {
                            products[productIndex].stock -= orderItem.quantity;
                        }
                    });
                    saveProducts();
                    updateStockReports();
                }
                
                saveScheduledOrders();
                alert(`Order status has been updated to ${newStatus}!`);
            }
        }

        function cancelOrder(orderId) {
            if (confirm('Are you sure you want to cancel this order?')) {
                updateOrderStatus(orderId, 'Cancelled');
            }
        }

        // Staff dashboard functions
        function showStaffSection(section) {
            // Update sidebar active state
            const sidebarLinks = document.querySelectorAll('#staffDashboard .sidebar-menu a');
            sidebarLinks.forEach(link => link.classList.remove('active'));
            event.target.classList.add('active');
            
            // Hide all sections
            const sections = document.querySelectorAll('#staffDashboard .tab-content');
            sections.forEach(sec => sec.classList.remove('active'));
            
            // Show selected section
            document.getElementById('staff' + section.charAt(0).toUpperCase() + section.slice(1) + 'Section').classList.add('active');
            
            // Load content in relevant sections
            if (section === 'stock') {
                updateStockReports();
            } else if (section === 'stockManagement') {
                loadStockManagement();
            } else if (section === 'scheduledOrders') {
                loadScheduledOrdersInAllSections();
            } else if (section === 'reviews') {
                setTimeout(() => {
                    if (document.getElementById('staffReviewsChart')) {
                        initializeStaffReviewsChart();
                    }
                }, 100);
            } else if (section === 'attendance') {
                setTimeout(() => {
                    if (document.getElementById('staffAttendanceChart')) {
                        initializeStaffAttendanceChart();
                    }
                }, 100);
            }
        }

        // Task management functions
        function completeTask(taskId) {
            // Find the task row
            const taskRow = event.target.closest('tr');
            const statusCell = taskRow.querySelector('.badge');
            const actionCell = taskRow.querySelector('td:last-child');
            
            // Update status
            statusCell.className = 'badge badge-success';
            statusCell.textContent = 'Completed';
            
            // Remove action button
            actionCell.innerHTML = '';
            
            alert(`Task ${taskId} has been completed!`);
            
            // Move to completed tasks section
            setTimeout(() => {
                const completedTasksTable = document.querySelector('#staffWorkSection .data-table:last-child tbody');
                const newRow = taskRow.cloneNode(true);
                newRow.querySelector('.badge').className = 'badge badge-success';
                newRow.querySelector('.badge').textContent = 'Completed';
                newRow.querySelector('td:last-child').innerHTML = '';
                completedTasksTable.appendChild(newRow);
                taskRow.remove();
            }, 500);
        }

        function startTask(taskId) {
            // Find the task row
            const taskRow = event.target.closest('tr');
            const statusCell = taskRow.querySelector('.badge');
            const actionCell = taskRow.querySelector('td:last-child');
            
            // Update status
            statusCell.className = 'badge badge-warning';
            statusCell.textContent = 'In Progress';
            
            // Update action button
            actionCell.innerHTML = `<button class="btn btn-small" onclick="completeTask('${taskId}')">Complete</button>`;
            
            alert(`Task ${taskId} has been started!`);
        }

        // Customer dashboard functions
        function showCustomerSection(section) {
            // Update sidebar active state
            const sidebarLinks = document.querySelectorAll('#customerDashboard .sidebar-menu a');
            sidebarLinks.forEach(link => link.classList.remove('active'));
            event.target.classList.add('active');
            
            // Hide all sections
            const sections = document.querySelectorAll('#customerDashboard .tab-content');
            sections.forEach(sec => sec.classList.remove('active'));
            
            // Show selected section
            document.getElementById('customer' + section.charAt(0).toUpperCase() + section.slice(1) + 'Section').classList.add('active');
            
            // Load content in relevant sections
            if (section === 'scheduledOrders') {
                loadScheduledOrdersInAllSections();
            } else if (section === 'products') {
                // Ensure products are loaded when section is shown
                loadCustomerProducts();
            } else if (section === 'orders') {
                loadCustomerOrders();
            }
        }

        // Cart functions
        function loadCart() {
            const cartItemsContainer = document.getElementById('cartItems');
            cartItemsContainer.innerHTML = '';
            
            if (cart.length === 0) {
                cartItemsContainer.innerHTML = '<p style="text-align: center; padding: 2rem;">Your cart is empty</p>';
            } else {
                cart.forEach((item, index) => {
                    const cartItem = document.createElement('div');
                    cartItem.className = 'cart-item';
                    cartItem.innerHTML = `
                        <div class="cart-item-info">
                            <div class="cart-item-image">
                                <i class="fas ${item.icon}"></i>
                            </div>
                            <div class="cart-item-details">
                                <h4>${item.name}</h4>
                                <p>₹${item.price.toFixed(2)} each</p>
                            </div>
                        </div>
                        <div class="cart-item-actions">
                            <div class="quantity-control">
                                <button class="quantity-btn" onclick="updateCartQuantity(${index}, ${item.quantity - 1})">-</button>
                                <input type="number" class="quantity-input" value="${item.quantity}" min="1" onchange="updateCartQuantity(${index}, this.value)">
                                <button class="quantity-btn" onclick="updateCartQuantity(${index}, ${item.quantity + 1})">+</button>
                            </div>
                            <div class="cart-item-price">₹${(item.price * item.quantity).toFixed(2)}</div>
                            <button class="btn btn-small btn-secondary" onclick="removeFromCart(${index})">Remove</button>
                        </div>
                    `;
                    cartItemsContainer.appendChild(cartItem);
                });
            }
            
            updateCartTotal();
        }

        function addToCart(productName, price, icon = 'fa-box') {
            const existingItem = cart.find(item => item.name === productName);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    name: productName,
                    price: price,
                    quantity: 1,
                    icon: icon
                });
            }
            
            loadCart();
            alert(`${productName} added to cart!`);
        }

        function updateCartQuantity(index, newQuantity) {
            newQuantity = parseInt(newQuantity);
            if (newQuantity > 0) {
                cart[index].quantity = newQuantity;
                loadCart();
            }
        }

        function removeFromCart(index) {
            cart.splice(index, 1);
            loadCart();
        }

        function updateCartTotal() {
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            document.getElementById('cartTotal').textContent = `₹${total.toFixed(2)}`;
            document.getElementById('checkoutTotal').textContent = `₹${total.toFixed(2)}`;
        }

        function clearCart() {
            if (confirm('Are you sure you want to clear your cart?')) {
                cart = [];
                loadCart();
            }
        }

        function openCheckoutModal() {
            if (cart.length === 0) {
                alert('Your cart is empty!');
                return;
            }
            
            // Load order summary
            const checkoutOrderSummary = document.getElementById('checkoutOrderSummary');
            checkoutOrderSummary.innerHTML = '';
            
            cart.forEach(item => {
                const orderItem = document.createElement('div');
                orderItem.style.marginBottom = '0.5rem';
                orderItem.innerHTML = `
                    <div style="display: flex; justify-content: space-between;">
                        <span>${item.name} x ${item.quantity}</span>
                        <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                `;
                checkoutOrderSummary.appendChild(orderItem);
            });
            
            // Set minimum date to today
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('deliveryDate').setAttribute('min', today);
            document.getElementById('deliveryDate').value = today;
            
            // Open the modal
            document.getElementById('checkoutModal').classList.add('active');
        }

        function processCheckout() {
            const deliveryDate = document.getElementById('deliveryDate').value;
            const deliveryTime = document.getElementById('deliveryTime').value;
            const specialInstructions = document.getElementById('specialInstructions').value;
            
            if (!deliveryDate || !deliveryTime) {
                alert('Please select a pickup date and time!');
                return;
            }
            
            const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            const newOrder = {
                id: orderIdCounter++,
                customer: currentUser.username,
                items: [...cart],
                total: total,
                scheduledDate: deliveryDate,
                scheduledTime: deliveryTime,
                specialInstructions: specialInstructions,
                status: 'Pending',
                orderDate: new Date().toISOString()
            };
            
            scheduledOrders.push(newOrder);
            saveScheduledOrders();
            
            // Update order ID counter
            localStorage.setItem('orderIdCounter', orderIdCounter.toString());
            
            alert('Order placed successfully! Your order has been scheduled for pickup.');
            closeModal('checkoutModal');
            
            // Clear cart
            cart = [];
            loadCart();
            
            // Update customer orders
            loadCustomerOrders();
        }

        function loadCustomerOrders() {
            // Load recent orders in dashboard
            const customerRecentOrders = document.getElementById('customerRecentOrders');
            if (customerRecentOrders) {
                customerRecentOrders.innerHTML = '';
                
                const customerOrders = scheduledOrders.filter(order => order.customer === currentUser.username);
                const recentOrders = customerOrders.slice(0, 3);
                
                recentOrders.forEach(order => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>#${order.id}</td>
                        <td>${new Date(order.orderDate).toLocaleDateString()}</td>
                        <td>${order.items.length}</td>
                        <td>₹${order.total.toFixed(2)}</td>
                        <td><span class="badge ${getStatusBadgeClass(order.status)}">${order.status}</span></td>
                    `;
                    customerRecentOrders.appendChild(row);
                });
            }
            
            // Load all orders in orders section
            const customerOrdersTable = document.getElementById('customerOrdersTable');
            if (customerOrdersTable) {
                customerOrdersTable.innerHTML = '';
                
                const customerOrders = scheduledOrders.filter(order => order.customer === currentUser.username);
                customerOrders.forEach(order => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>#${order.id}</td>
                        <td>${new Date(order.orderDate).toLocaleDateString()}</td>
                        <td>${order.items.length}</td>
                        <td>₹${order.total.toFixed(2)}</td>
                        <td><span class="badge ${getStatusBadgeClass(order.status)}">${order.status}</span></td>
                        <td>
                            <button class="btn btn-small" onclick="viewOrderDetails(${order.id})">View Details</button>
                            ${order.status === 'Completed' ? `<button class="btn btn-small btn-secondary" onclick="openModal('rateProductModal')">Rate Products</button>` : ''}
                        </td>
                    `;
                    customerOrdersTable.appendChild(row);
                });
            }
        }

        function loadProductsInAllSections() {
            // Load products in customer dashboard
            loadCustomerProducts();
            
            // Load products in staff dashboard
            loadStaffProducts();
        }

        function loadCustomerProducts() {
            // Load recommended products
            const recommendedGrid = document.getElementById('recommendedProductsGrid');
            if (recommendedGrid) {
                recommendedGrid.innerHTML = '';
                
                const recommendedItems = products.slice(0, 4);
                recommendedItems.forEach(item => {
                    const productCard = createProductCard(item);
                    recommendedGrid.appendChild(productCard);
                });
            }
            
            // Load all products
            const allProductsGrid = document.getElementById('allProductsGrid');
            if (allProductsGrid) {
                allProductsGrid.innerHTML = '';
                
                products.forEach(item => {
                    const productCard = createProductCard(item);
                    allProductsGrid.appendChild(productCard);
                });
            }
            
            // Load cart recommended products
            const cartRecommendedGrid = document.getElementById('cartRecommendedGrid');
            if (cartRecommendedGrid) {
                cartRecommendedGrid.innerHTML = '';
                
                const cartRecommendedItems = products.slice(0, 4);
                cartRecommendedItems.forEach(item => {
                    const productCard = createProductCard(item);
                    cartRecommendedGrid.appendChild(productCard);
                });
            }
        }

        function loadStaffProducts() {
            // This function can be used to load products in staff dashboard if needed
        }

        function createProductCard(item) {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <div class="product-image">
                    <i class="fas ${item.icon} fa-3x"></i>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${item.name}</h3>
                    <div class="product-price">₹${item.price.toFixed(2)}</div>
                    <div class="product-stock">In Stock: ${item.stock}</div>
                    <div class="product-category">${item.category}</div>
                    <button class="btn btn-small btn-block" onclick="addToCart('${item.name}', ${item.price}, '${item.icon}')" ${item.stock === 0 ? 'disabled' : ''}>${item.stock === 0 ? 'Out of Stock' : 'Add to Cart'}</button>
                </div>
            `;
            return productCard;
        }

        // Offline Order functions
        function loadOfflineOrderProducts() {
            const offlineOrderProducts = document.getElementById('offlineOrderProducts');
            offlineOrderProducts.innerHTML = '';
            
            products.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.className = 'form-group';
                productDiv.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <input type="checkbox" id="offline-product-${product.id}" class="offline-product-checkbox" value="${product.id}" onchange="updateOfflineOrderTotal()">
                        <label for="offline-product-${product.id}" style="margin: 0;">${product.name} - ₹${product.price.toFixed(2)}</label>
                        <input type="number" id="offline-quantity-${product.id}" min="1" value="1" style="width: 70px;" onchange="updateOfflineOrderTotal()">
                    </div>
                `;
                offlineOrderProducts.appendChild(productDiv);
            });
        }

        function updateOfflineOrderTotal() {
            let total = 0;
            const productCheckboxes = document.querySelectorAll('.offline-product-checkbox:checked');
            
            productCheckboxes.forEach(checkbox => {
                const productId = parseInt(checkbox.value);
                const product = products.find(p => p.id === productId);
                const quantity = parseInt(document.getElementById(`offline-quantity-${productId}`).value) || 0;
                
                if (product) {
                    total += product.price * quantity;
                }
            });
            
            document.getElementById('offlineOrderTotal').textContent = `₹${total.toFixed(2)}`;
        }

        function createOfflineOrder() {
            const customerName = document.getElementById('offlineCustomerName').value;
            const customerPhone = document.getElementById('offlineCustomerPhone').value;
            const deliveryDate = document.getElementById('offlineDeliveryDate').value;
            const deliveryTime = document.getElementById('offlineDeliveryTime').value;
            const specialInstructions = document.getElementById('offlineSpecialInstructions').value;
            
            if (!customerName || !customerPhone || !deliveryDate || !deliveryTime) {
                alert('Please fill all required fields!');
                return;
            }
            
            const offlineCart = [];
            const productCheckboxes = document.querySelectorAll('.offline-product-checkbox:checked');
            
            if (productCheckboxes.length === 0) {
                alert('Please select at least one product!');
                return;
            }
            
            productCheckboxes.forEach(checkbox => {
                const productId = parseInt(checkbox.value);
                const product = products.find(p => p.id === productId);
                const quantity = parseInt(document.getElementById(`offline-quantity-${productId}`).value) || 0;
                
                if (product && quantity > 0) {
                    offlineCart.push({
                        name: product.name,
                        price: product.price,
                        quantity: quantity,
                        icon: product.icon
                    });
                }
            });
            
            const total = offlineCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            
            // Get current date and time
            const now = new Date();
            const currentDate = now.toISOString().split('T')[0];
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const formattedTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
            
            const newOrder = {
                id: orderIdCounter++,
                customer: `${customerName} (${customerPhone})`,
                items: offlineCart,
                total: total,
                scheduledDate: currentDate,
                scheduledTime: formattedTime,
                specialInstructions: specialInstructions,
                status: 'Completed', // Offline orders are completed immediately
                orderDate: now.toISOString(),
                isOffline: true
            };
            
            // Reduce stock for each item in the order
            newOrder.items.forEach(orderItem => {
                const productIndex = products.findIndex(p => p.name === orderItem.name);
                if (productIndex !== -1) {
                    products[productIndex].stock -= orderItem.quantity;
                }
            });
            
            scheduledOrders.push(newOrder);
            saveProducts();
            saveScheduledOrders();
            
            // Update order ID counter
            localStorage.setItem('orderIdCounter', orderIdCounter.toString());
            
            alert('Offline order created successfully!');
            closeModal('offlineOrderModal');
        }

        // Modal functions
        function openModal(modalId, staffName = '') {
            if (modalId === 'rateStaffModal' && staffName) {
                document.getElementById('staffNameToRate').textContent = staffName;
            } else if (modalId === 'offlineOrderModal') {
                loadOfflineOrderProducts();
                updateOfflineOrderTotal();
                
                // Set current date and time automatically
                const now = new Date();
                const currentDate = now.toISOString().split('T')[0];
                const currentHour = now.getHours();
                const currentMinute = now.getMinutes();
                const formattedTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
                
                document.getElementById('offlineDeliveryDate').value = currentDate;
                document.getElementById('offlineDeliveryTime').value = formattedTime;
            }
            
            document.getElementById(modalId).classList.add('active');
        }

        function closeModal(modalId) {
            document.getElementById(modalId).classList.remove('active');
        }

        // Rating functions
        function setupRatingInputs() {
            // Staff rating input
            const staffRatingInputs = document.querySelectorAll('#staffRatingInput i');
            staffRatingInputs.forEach(star => {
                star.addEventListener('click', function() {
                    selectedStaffRating = parseInt(this.getAttribute('data-rating'));
                    updateStarDisplay('staffRatingInput', selectedStaffRating);
                });
                
                star.addEventListener('mouseover', function() {
                    const hoverRating = parseInt(this.getAttribute('data-rating'));
                    updateStarDisplay('staffRatingInput', hoverRating);
                });
            });
            
            document.getElementById('staffRatingInput').addEventListener('mouseleave', function() {
                updateStarDisplay('staffRatingInput', selectedStaffRating);
            });
            
            // Product rating input
            const productRatingInputs = document.querySelectorAll('#productRatingInput i');
            productRatingInputs.forEach(star => {
                star.addEventListener('click', function() {
                    selectedProductRating = parseInt(this.getAttribute('data-rating'));
                    updateStarDisplay('productRatingInput', selectedProductRating);
                });
                
                star.addEventListener('mouseover', function() {
                    const hoverRating = parseInt(this.getAttribute('data-rating'));
                    updateStarDisplay('productRatingInput', hoverRating);
                });
            });
            
            document.getElementById('productRatingInput').addEventListener('mouseleave', function() {
                updateStarDisplay('productRatingInput', selectedProductRating);
            });
        }

        function updateStarDisplay(inputId, rating) {
            const stars = document.querySelectorAll(`#${inputId} i`);
            stars.forEach((star, index) => {
                if (index < rating) {
                    star.classList.remove('far');
                    star.classList.add('fas');
                } else {
                    star.classList.remove('fas');
                    star.classList.add('far');
                }
            });
        }

        function submitStaffRating() {
            if (selectedStaffRating === 0) {
                alert('Please select a rating');
                return;
            }
            
            const comment = document.getElementById('staffComment').value;
            alert(`Thank you for rating ${document.getElementById('staffNameToRate').textContent}!`);
            closeModal('rateStaffModal');
            
            // Reset form
            selectedStaffRating = 0;
            updateStarDisplay('staffRatingInput', 0);
            document.getElementById('staffComment').value = '';
        }

        function submitProductRating() {
            if (selectedProductRating === 0) {
                alert('Please select a rating');
                return;
            }
            
            const product = document.getElementById('productToRate').value;
            const comment = document.getElementById('productComment').value;
            alert(`Thank you for rating ${product}!`);
            closeModal('rateProductModal');
            
            // Reset form
            selectedProductRating = 0;
            updateStarDisplay('productRatingInput', 0);
            document.getElementById('productComment').value = '';
        }

        // Chart initialization functions
        function initializeCharts() {
            // Admin Dashboard Charts
            const adminSalesCtx = document.getElementById('adminSalesChart');
            if (adminSalesCtx) {
                new Chart(adminSalesCtx.getContext('2d'), {
                    type: 'line',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                        datasets: [{
                            label: 'Sales',
                            data: [12000, 19000, 15000, 25000, 22000],
                            backgroundColor: 'rgba(79, 70, 229, 0.2)',
                            borderColor: 'rgba(79, 70, 229, 1)',
                            borderWidth: 2,
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function(value) {
                                        return '₹' + value.toLocaleString();
                                    }
                                }
                            }
                        }
                    }
                });
            }

            // Staff Dashboard Charts
            const staffTaskCtx = document.getElementById('staffTaskChart');
            if (staffTaskCtx) {
                new Chart(staffTaskCtx.getContext('2d'), {
                    type: 'doughnut',
                    data: {
                        labels: ['Completed', 'In Progress', 'Not Started'],
                        datasets: [{
                            data: [24, 7, 5],
                            backgroundColor: [
                                'rgba(16, 185, 129, 0.8)',
                                'rgba(245, 158, 11, 0.8)',
                                'rgba(107, 114, 128, 0.8)'
                            ],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'right'
                            }
                        }
                    }
                });
            }

            const staffRatingCtx = document.getElementById('staffRatingChart');
            if (staffRatingCtx) {
                new Chart(staffRatingCtx.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: ['5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'],
                        datasets: [{
                            label: 'Reviews',
                            data: [18, 12, 5, 2, 1],
                            backgroundColor: [
                                'rgba(16, 185, 129, 0.8)',
                                'rgba(16, 185, 129, 0.6)',
                                'rgba(245, 158, 11, 0.8)',
                                'rgba(245, 158, 11, 0.6)',
                                'rgba(239, 68, 68, 0.8)'
                            ],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }

            // Admin Feedback Chart
            const adminFeedbackCtx = document.getElementById('adminFeedbackChart');
            if (adminFeedbackCtx) {
                new Chart(adminFeedbackCtx.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: ['5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'],
                        datasets: [{
                            label: 'Reviews',
                            data: [120, 85, 45, 15, 5],
                            backgroundColor: [
                                'rgba(16, 185, 129, 0.8)',
                                'rgba(16, 185, 129, 0.6)',
                                'rgba(245, 158, 11, 0.8)',
                                'rgba(245, 158, 11, 0.6)',
                                'rgba(239, 68, 68, 0.8)'
                            ],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
        }

        // Initialize specific charts when needed
        function initializeAdminTopItemsChart() {
            const adminTopItemsCtx = document.getElementById('adminTopItemsChart');
            if (adminTopItemsCtx) {
                new Chart(adminTopItemsCtx.getContext('2d'), {
                    type: 'bar',
                    indexAxis: 'y',
                    data: {
                        labels: ['Laptop Pro', 'Wireless Headphones', 'Cotton T-Shirt', 'Running Shoes', 'Smart Watch'],
                        datasets: [{
                            label: 'Units Sold',
                            data: [124, 89, 210, 76, 64],
                            backgroundColor: 'rgba(79, 70, 229, 0.8)',
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            x: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
        }

        function initializeStaffReviewsChart() {
            const staffReviewsCtx = document.getElementById('staffReviewsChart');
            if (staffReviewsCtx) {
                new Chart(staffReviewsCtx.getContext('2d'), {
                    type: 'line',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                        datasets: [{
                            label: 'Average Rating',
                            data: [4.2, 4.3, 4.1, 4.4, 4.6],
                            backgroundColor: 'rgba(79, 70, 229, 0.2)',
                            borderColor: 'rgba(79, 70, 229, 1)',
                            borderWidth: 2,
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: false,
                                min: 3,
                                max: 5
                            }
                        }
                    }
                });
            }
        }

        function initializeStaffAttendanceChart() {
            const staffAttendanceCtx = document.getElementById('staffAttendanceChart');
            if (staffAttendanceCtx) {
                new Chart(staffAttendanceCtx.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                        datasets: [{
                            label: 'Hours Worked',
                            data: [8, 8.5, 8, 7.5, 8, 0, 0],
                            backgroundColor: 'rgba(79, 70, 229, 0.8)',
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
        }
