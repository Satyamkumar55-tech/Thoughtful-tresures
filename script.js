document.addEventListener('DOMContentLoaded', () => {
    // Navbar Scroll Effect
    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Mobile Menu Toggle
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    mobileToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        mobileToggle.classList.toggle('active');
        
        // Animate bars
        const bars = mobileToggle.querySelectorAll('.bar');
        if (mobileToggle.classList.contains('active')) {
            bars[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
            bars[1].style.opacity = '0';
            bars[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
        } else {
            bars[0].style.transform = 'none';
            bars[1].style.opacity = '1';
            bars[2].style.transform = 'none';
        }
    });

    // Close mobile menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileToggle.classList.remove('active');
            const bars = mobileToggle.querySelectorAll('.bar');
            bars[0].style.transform = 'none';
            bars[1].style.opacity = '1';
            bars[2].style.transform = 'none';
        });
    });

    // Fade-up Animation on Scroll
    const fadeElements = document.querySelectorAll('.fade-up');
    
    const fadeObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    fadeElements.forEach(el => {
        fadeObserver.observe(el);
    });

    // Smooth Scroll for Navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Cart State & Elements
    let cart = [];
    const cartIcon = document.getElementById('cart-icon');
    const cartCountElement = document.getElementById('cart-count');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartDrawerOverlay = document.getElementById('cart-drawer-overlay');
    const cartDrawerClose = document.getElementById('cart-drawer-close');
    const cartDrawerItems = document.getElementById('cart-drawer-items');
    const cartTotalPriceElement = document.getElementById('cart-total-price');
    const toastContainer = document.getElementById('toast-container');

    // Toggle Cart Drawer
    const toggleCart = (isOpen) => {
        if (isOpen) {
            cartDrawer.classList.add('active');
            cartDrawerOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
            renderCart();
        } else {
            cartDrawer.classList.remove('active');
            cartDrawerOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    };

    if (cartIcon) cartIcon.addEventListener('click', (e) => {
        e.preventDefault();
        toggleCart(true);
    });
    if (cartDrawerClose) cartDrawerClose.addEventListener('click', () => toggleCart(false));
    if (cartDrawerOverlay) cartDrawerOverlay.addEventListener('click', () => toggleCart(false));

    // Add to Cart Logic
    const addToCart = (product) => {
        const existingItem = cart.find(item => item.title === product.title);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        
        updateCartCount();
        showToast(product.title);
    };

    const updateCartCount = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCountElement) {
            cartCountElement.textContent = totalItems;
            cartCountElement.style.transform = 'scale(1.5)';
            setTimeout(() => {
                cartCountElement.style.transform = 'scale(1)';
            }, 200);
        }
    };

    const showToast = (productName) => {
        const toast = document.createElement('div');
        toast.classList.add('toast');
        toast.innerHTML = `🛒 <strong>${productName}</strong> added to cart!`;
        toastContainer.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    };

    const renderCart = () => {
        if (!cartDrawerItems) return;
        
        if (cart.length === 0) {
            cartDrawerItems.innerHTML = '<div class="cart-empty-msg">Your cart is empty</div>';
            cartTotalPriceElement.textContent = '$0.00';
            return;
        }

        cartDrawerItems.innerHTML = '';
        let total = 0;

        cart.forEach((item, index) => {
            const priceNum = parseFloat(item.price.replace('$', ''));
            total += priceNum * item.quantity;

            const itemEl = document.createElement('div');
            itemEl.classList.add('cart-item');
            itemEl.innerHTML = `
                <img src="${item.img}" alt="${item.title}" class="cart-item-img">
                <div class="cart-item-info">
                    <h4 class="cart-item-title">${item.title}</h4>
                    <p class="cart-item-price">${item.price}</p>
                    <div class="cart-item-controls">
                        <button class="quantity-btn minus" data-index="${index}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" data-index="${index}">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" data-index="${index}">🗑️</button>
            `;
            cartDrawerItems.appendChild(itemEl);
        });

        cartTotalPriceElement.textContent = `$${total.toFixed(2)}`;

        // Add Listeners to buttons inside cart
        document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                cart[index].quantity += 1;
                renderCart();
                updateCartCount();
            });
        });

        document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                if (cart[index].quantity > 1) {
                    cart[index].quantity -= 1;
                } else {
                    cart.splice(index, 1);
                }
                renderCart();
                updateCartCount();
            });
        });

        document.querySelectorAll('.cart-item-remove').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.target.dataset.index;
                cart.splice(index, 1);
                renderCart();
                updateCartCount();
            });
        });
    };

    // Product Card Button Listeners
    const productButtons = document.querySelectorAll('.btn-primary');
    productButtons.forEach(button => {
        if (button.textContent.trim().toLowerCase() === 'add to cart' && !button.id.includes('modal')) {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const card = e.target.closest('.card');
                if (card) {
                    const title = card.querySelector('.card-title').textContent;
                    const price = card.querySelector('.card-price').textContent;
                    const img = card.querySelector('img').src;
                    addToCart({ title, price, img });
                }
            });
        }
    });

    // Modal Functionality
    const modal = document.getElementById('product-modal');
    const modalClose = document.getElementById('modal-close');
    const viewButtons = document.querySelectorAll('.btn-outline');
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalPrice = document.getElementById('modal-price');
    const modalDesc = document.getElementById('modal-desc');
    const modalBadge = document.getElementById('modal-badge');
    const modalAddCart = document.getElementById('modal-add-cart');

    viewButtons.forEach(button => {
        if (button.textContent.trim().toLowerCase() === 'view') {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const card = e.target.closest('.card');
                if (card) {
                    const title = card.querySelector('.card-title').textContent;
                    const price = card.querySelector('.card-price').textContent;
                    const desc = card.querySelector('.card-desc').textContent;
                    const img = card.querySelector('img').src;
                    const badge = card.querySelector('.card-badge');

                    modalTitle.textContent = title;
                    modalPrice.textContent = price;
                    modalDesc.textContent = desc;
                    modalImg.src = img;
                    
                    if (badge) {
                        modalBadge.textContent = badge.textContent;
                        modalBadge.style.display = 'inline-block';
                    } else {
                        modalBadge.style.display = 'none';
                    }
                    
                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        }
    });

    if (modalClose) {
        modalClose.addEventListener('click', () => {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    if (modalAddCart) {
        modalAddCart.addEventListener('click', () => {
            const product = {
                title: modalTitle.textContent,
                price: modalPrice.textContent,
                img: modalImg.src
            };
            addToCart(product);
            modal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
});
