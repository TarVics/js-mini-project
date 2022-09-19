/*

# mini-project

### В index.html
1. отримати масив об'єктів з endpoint https://jsonplaceholder.typicode.com/users
2. Вивести id, name всіх user в index.html. Окремий блок для кожного user.
3. Додати кожному блоку кнопку/посилання, при клацанні на яку відбувається перехід на сторінку user-details.html,
   котра має детальну інформацію про об'єкт на який клацнули


### На сторінці user-details.html:
4. Вивести всю, без виключення, інформацію про об'єкт user на який клацнули
5. Додати кнопку "post of current user", при клацанні на яку, з'являються title всіх постів поточного користувача
   (для отримання постів використайте endpoint https://jsonplaceholder.typicode.com/users/USER_ID/posts)
6. Кожному посту додати кнопку/посилання, при клацанні на яку відбувається перехід на сторінку post-details.html,
   котра має детальну інфу про поточний пост.


### На сторінці post-details.html:
7. Вивести всю, без виключення, інформацію про об'єкт post на який клацнули.
8. Нижче інформації про пост, вивести всі коментарі поточного поста
   (endpoint - https://jsonplaceholder.typicode.com/posts/POST_ID/comments)


### Стилізація проєкту -
- index.html - всі блоки з user - по 2 в рядок. кнопки/посилання розташувати під інформацією про user.
- user-details.html - блок з інфою про user зверху сторінки. Кнопка нижче, на 90% ширини сторінки, по центру.
- блоки з короткою інфою про post - в ряд по 5.
- post-details.html - блок з інфою про пост зверху. Коментарі - по 4 в ряд.
- Всі елементи котрі характеризують users, posts, comments візуалізувати, так, щоб було видно що це блоки
  (дати background, margin і т.д.)

*/

/**
 * @author Victor Taran <tarvics@gmail.com>
 */

/**
 * Callback для задання параметрів елемента за допомогою функції {@link makeTag}
 * @callback fnParamsCallback
 * @param {HTMLElement} element Елемент, якому потрібно вказати параметри
 */

/**
 * Додаткова інформація, яка використовується під час створення тегу функцією {@link makeTag}
 * @typedef {Object} TagInfo
 * @property {string?} className назва класу, із пробілами в ролі роздільників, у випадку, якщо кілька класів
 * @property {string?} id ID тегу
 * @property {string?} innerHTML innerHTML значення тегу
 * @property {string?} innerText innerText значення тегу. Якщо, цей атрибут заданий, то значення атрибуту html - буде ігноруватись
 * @property {string?} tagName назва тегу
 */

/**
 * Створення вкладених тегів
 * @param {string|TagInfo} tag Назва тегу або об'єкт із додатковою інформацією про тег
 * @param {fnParamsCallback|HTMLElement} fnParams Callback функція для задання параметрів елемента
 * У випадку, якщо функція не задана, то даний параметр буде вважатись дочірнім елементом, який додається
 * до поточного елемента
 * @param {...HTMLElement} children Дочірні елементи, які будуть додані до поточного елемента
 * @returns {HTMLElement}
 */
const makeTag = function (tag, fnParams = undefined, ...children) {
    let res;

    if (typeof tag === 'object') {
        res = document.createElement(tag.tagName || 'div');
        if (tag.id) res.id = tag.id;
        if (tag.className) res.className = tag.className;
        if (tag.innerText) {
            res.innerText = tag.innerText;
        } else if (tag.innerHTML) {
            res.innerHTML = tag.innerHTML;
        }
    } else {
        res = document.createElement(tag);
    }

    if (typeof fnParams === 'function') {
        fnParams(res);
        if (children.length) res.append(...children);
    } else if (fnParams) {
        res.append(fnParams, ...children);
    } else {
        res.append(...children);
    }

    return res;
}

/**
 * Виконання команди fetch із наступним розбором отриманого вмісту як JSON
 * @param {string} url Адреса запиту
 * @param {object} params Параметри запиту
 * @returns {Promise<any>}
 */
const loadJSON = (url, params = undefined) => {
    console.log('fetch:', url);
    return fetch(url, params).then(response => response.json());
}

/**
 * Перевірка різниці дат prevDate та currDate на перевищення заданого значення expirationTime, вираженого у секундах
 * @param {Date} prevDate Попередня дата
 * @param {Date} currDate Поточна дата
 * @param {number} expirationTime Максимальне значення, виражене у секундах, яке допустиме для різниці дат currDate та prevDate
 * @returns {boolean}
 */
const isExpired = (prevDate, currDate, expirationTime) => {
    if (prevDate > currDate) [prevDate, currDate] = [currDate, prevDate];
    return (currDate.getTime() - prevDate.getTime()) / 1000 > expirationTime;
}

/**
 * Запис даних у сховище поточного сеансу із додаванням поточного часу
 * @param {string} name Назва параметра у локальному сховищі
 * @param {any} data Дані, які будуть записані до локального сховища
 */
const writeStorageData = (name, data) => {
    console.log('save:', name);
    const date = new Date().getTime();
    sessionStorage.setItem(name, JSON.stringify({ date, data }));
}

/**
 * Зчитування даних зі сховища поточного сеансу при умові, що ці дані були записані не раніше,
 * ніж expirationTime секунд тому
 * @param {string} name Назва параметра у локальному сховищі
 * @param {number = '0'} expirationTime Максимальне значення, виражене у секундах, яке допустиме для успішного результату
 * @returns {*|null}
 */
const readStorageData = (name, expirationTime= 0) => {
    console.log('read:', name);
    const item = JSON.parse(sessionStorage.getItem(name));
    return (item && (expirationTime <= 0 || !isExpired(new Date(item.date), new Date(), expirationTime))) ? item.data : null;
}

/********************************************************************/

/**
 * Дані для розміщення смуги із даними про сторінки (breadcrumbs)
 * @typedef {Object} BreadCrumbInfo
 * @property {string} title Напис, який описує посилання
 * @property {string?} href Посилання для переходу на сторінку
 */

/**
 * Друк смуги із даними про сторінки (breadcrumbs), на які можливо перейти за посиланнями, вказаними в items
 * @param {HTMLElement} owner Елемент, на якому буде виконано друк
 * @param {BreadCrumbInfo[]} items Дані для смуги про сторінки (breadcrumbs)
 */
const drawBreadCrumbs = (owner, items = []) => {
    const ul = makeTag({ tagName: 'ul', className: 'breadcrumb' }, ul => {
        items.forEach(item => {
            if (item.href) {
                ul.appendChild(
                    makeTag('li',
                        makeTag('a', a => { a.href = item.href; a.innerText = item.title; })
                    )
                );
            } else {
                ul.appendChild(makeTag({ tagName: 'li', innerText: item.title }));
            }
        });
    });
    owner.appendChild(ul);
}

/********************************************************************/

const application = {
    pages: {},
    expireTime: 30,

    /**
     * Отримання адреси активного документу
     * @returns {string}
     */
    getPath () { return '.' + location.pathname.substring(location.pathname.lastIndexOf('/')); },

    /**
     * Виконання сторінки відповідно до шляху поточного href
     * @param {string = ''} defaultPage код сторінки, який буде виконано, у випадку, якщо не буде знайдено сторінки
     * відповідно до шляху поточного href
     * @returns {object}
     */
    perform (defaultPage = '') {
        const path = this.getPath();
        for (const page of Object.values(this.pages)) {
            if (path === page.getPath() ) {
                return page.perform();
            }
        }
        if (defaultPage && this.pages[defaultPage]) {
            return this.pages[defaultPage].perform();
        }
    }
}

/**
 * Використаємо властивості циклу подій.
 * Функція буде виконана після того, як буде сформовано список доступних сторінок
 */
setTimeout(() => application.perform());

/********************************************************************/

/**
 * Дані про координати адреси користувача
 * @typedef {Object} UserAddressGeo
 * @property {string} lat широта
 * @property {string} lng довгота
 */

/**
 * Дані про адресу користувача
 * @typedef {Object} UserAddress
 * @property {string} street вулиця
 * @property {string} suite приміщення
 * @property {string} city місто
 * @property {string} zipcode zip код
 * @property {UserAddressGeo} geo координати
 */

/**
 * Дані про компанію користувача
 * @typedef {Object} UserCompany
 * @property {string} name назва
 * @property {string} catchPhrase крилата фраза
 * @property {string} bs слоган
 */

/**
 * Дані про користувача
 * @typedef {Object} User
 * @property {number} id id
 * @property {string} name ім'я
 * @property {string} username логін
 * @property {string} email email
 * @property {UserAddress} address адреса
 * @property {string} phone телефон
 * @property {string} website web сайт
 * @property {UserCompany} company компанія
 */

/**
 * Дані про пост користувача
 * @typedef {Object} UserPost
 * @property {number} userId id користувача
 * @property {number} id id посту
 * @property {string} title короткий вміст
 * @property {string} body повний вміст
 */

/**
 * Коментар до посту користувача
 * @typedef {Object} UserComment
 * @property {number} postId id посту
 * @property {number} id id коментаря
 * @property {string} name назва
 * @property {string} email електронна пошта
 * @property {string} body повний текст коментаря
 */

/**
 * Сторінка зі списком користувачів
 */
application.pages.users = {

    /**
     * Друк списку користувачів
     * @param {HTMLElement} owner Елемент, на якому буде виконано друк
     * @param {User[]} users Дані про користувача
     */
    drawUsers (owner, users) {
        const layout = makeTag({ className: 'layout width-2 columns-2' });
        users.forEach(user => {
            layout.appendChild(
                makeTag({ className: 'layout-card' },
                    makeTag({ className: 'layout-header', innerHTML: 'user ID#' + user.id }),
                    makeTag({ className: 'layout-body' },
                        makeTag({ className: 'layout-row' },
                            makeTag({ className: 'layout-value', innerHTML: user.name })
                        ),
                        makeTag({ className: 'layout-footer' },
                            makeTag('button', button => {
                                button.className = 'layout-button';
                                button.innerHTML = 'details >';
                                button.onclick = () => {
                                    writeStorageData('lastUser', user);
                                    location.href = application.pages.userDetails.getPath(user.id);
                                }
                            })
                        )
                    )
                )
            )
        });
        owner.appendChild(layout);
    },

    /**
     * Завантаження списку користувачів
     * @param {boolean} reload не використовувати кеш*
     * @returns {Promise<User[]>}
     */
    loadUsers (reload = true) {
        const users = reload ? null : readStorageData('users', application.expireTime);
        if (!users) {
            return loadJSON('https://jsonplaceholder.typicode.com/users').then(users => {
                if (!reload) writeStorageData('users', users);
                return users;
            });
        } else {
            return Promise.resolve(users)
        }
    },

    /**
     * Адреса зі списком користувачів
     * @returns {string}
     */
    getPath () { return './index.html' },

    /**
     * Робота сторінки зі списком користувачів
     * @returns {Promise<application.pages.users>}
     */
    async perform () {
        const owner = document.body;
        owner.classList.add('cursor-progress');
        try {
            const users = await this.loadUsers(false);
            drawBreadCrumbs(owner, [{ title: 'Users' }]);
            this.drawUsers(owner, users);
            return this;
        } finally {
            owner.classList.remove('cursor-progress')
        }
    }
}

/**
 * Сторінка з детальною інформацією користувача
 */
application.pages.userDetails = {

    /**
     * Друк повної інформації про користувача
     * @param {HTMLElement} owner Елемент, на якому буде виконано друк
     * @param {User} user Дані про користувача
     */
    drawUser (owner, user) {

        /* Left widget */
        const layout = makeTag({ className: 'layout columns-3' },
            makeTag({ className: 'layout-card' },
                makeTag({ className: 'layout-header', innerHTML: 'user ID#' + user.id }),
                makeTag({ className: 'layout-body' },
                    makeTag({ className: 'layout-row' },
                        makeTag({ className: 'layout-caption', innerHTML: 'name' }),
                        makeTag({ className: 'layout-value', innerHTML: user.name })
                    ),
                    makeTag({ className: 'layout-row' },
                        makeTag({ className: 'layout-caption', innerHTML: 'username' }),
                        makeTag({ className: 'layout-value', innerHTML: user.username })
                    ),
                    makeTag({ className: 'layout-row' },
                        makeTag({ className: 'layout-caption', innerHTML: 'email' }),
                        makeTag({ className: 'layout-value' },
                            makeTag('a', a => {
                                a.className = 'layout-value';
                                a.href = 'mailto:' + user.email;
                                a.innerHTML = user.email;
                            })
                        )
                    ),
                    makeTag({ className: 'layout-row' },
                        makeTag({ className: 'layout-caption', innerHTML: 'phone' }),
                        makeTag({ className: 'layout-value', innerHTML: user.phone })
                    ),
                    makeTag({ className: 'layout-row' },
                        makeTag({ className: 'layout-caption', innerHTML: 'website' }),
                        makeTag({ className: 'layout-value' },
                            makeTag('a', a => {
                                a.className = 'layout-value';
                                a.href = user.website;
                                a.innerHTML = user.website;
                                a.target = '_blank';
                            })
                        )
                    )
                )
            ),

            /* Middle widget */
            makeTag({ className: 'layout-card' },
                makeTag({ className: 'layout-header', innerHTML: 'address' }),
                makeTag({ className: 'layout-body' },
                    makeTag({ className: 'layout-row' },
                        makeTag({ className: 'layout-caption', innerHTML: 'street' }),
                        makeTag({ className: 'layout-value', innerHTML: user.address?.street })
                    ),
                    makeTag({ className: 'layout-row' },
                        makeTag({ className: 'layout-caption', innerHTML: 'suite' }),
                        makeTag({ className: 'layout-value', innerHTML: user.address?.suite })
                    ),
                    makeTag({ className: 'layout-row' },
                        makeTag({ className: 'layout-caption', innerHTML: 'city' }),
                        makeTag({ className: 'layout-value', innerHTML: user.address?.city })
                    ),
                    makeTag({ className: 'layout-row' },
                        makeTag({ className: 'layout-caption', innerHTML: 'zipcode' }),
                        makeTag({ className: 'layout-value', innerHTML: user.address?.zipcode })
                    ),
                    makeTag({ className: 'layout-header', innerHTML: 'geo' }),
                    makeTag({ className: 'layout-row' },
                        makeTag({ className: 'layout-caption', innerHTML: 'lat' }),
                        makeTag({ className: 'layout-value', innerHTML: user.address?.geo?.lat })
                    ),
                    makeTag({ className: 'layout-row' },
                        makeTag({ className: 'layout-caption', innerHTML: 'lng' }),
                        makeTag({ className: 'layout-value', innerHTML: user.address?.geo?.lng })
                    )
                )
            ),

            /* Right widget */
            makeTag({ className: 'layout-card' },
                makeTag({ className: 'layout-header', innerHTML: 'company' }),
                makeTag({ className: 'layout-body' },
                    makeTag({ className: 'layout-row' },
                        makeTag({ className: 'layout-caption', innerHTML: 'name' }),
                        makeTag({ className: 'layout-value', innerHTML: user.company?.name })
                    ),
                    makeTag({ className: 'layout-row' },
                        makeTag({ className: 'layout-caption', innerHTML: 'catch phrase' }),
                        makeTag({ className: 'layout-value', innerHTML: user.company?.catchPhrase })
                    ),
                    makeTag({ className: 'layout-row' },
                        makeTag({ className: 'layout-caption', innerHTML: 'bs' }),
                        makeTag({ className: 'layout-value', innerHTML: user.company?.bs })
                    )
                )
            )
        );

        const postsButton = makeTag('button', button => {
            button.id = 'load-user-posts-btn';
            button.innerText = 'post of current user';
            button.onclick = () => {
                owner.classList.add('cursor-progress');
                this.loadPosts(user.id, false)
                    .then(posts => this.drawPosts(owner, posts))
                    .finally(() => owner.classList.remove('cursor-progress'));
            }
        });

        owner.append(layout, postsButton);
    },

    /**
     * Друк інформації про пости користувача
     * @param {HTMLElement} owner Елемент, на якому буде виконано друк
     * @param {UserPost[]} posts Дані про пости користувача
     */
    drawPosts (owner, posts) {
        const layout = makeTag({ className: 'layout columns-5', id: 'load-user-posts-list' });
        posts.forEach(post => {
            layout.appendChild(
                makeTag({ className: 'layout-card' },
                    makeTag({ className: 'layout-header', innerHTML: 'post ID#' + post.id }),
                    makeTag({ className: 'layout-body' },
                        makeTag({ className: 'layout-row' },
                            makeTag({ className: 'layout-value', innerHTML: post.title })
                        ),
                        makeTag({ className: 'layout-footer' },
                            makeTag('button', button => {
                                button.className = 'layout-button';
                                button.innerHTML = 'details >';
                                button.onclick = () => {
                                    writeStorageData('lastPost', post);
                                    location.href = application.pages.postDetails.getPath(post.id);
                                }
                            })
                        )
                    )
                )
            )
        })
        owner.appendChild(layout);

        const prevList = document.getElementById('load-user-posts-list');
        if (prevList) prevList.remove();

        owner.appendChild(layout);
    },

    /**
     * Завантаження повної інформації про користувача
     * @param {number} userId - id користувача
     * @param {boolean} reload не використовувати кеш
     * @returns {Promise<User>}
     */
    loadUserDetails (userId, reload = true) {
        const user = reload ? null : readStorageData('lastUser', application.expireTime);
        if (!user || user.id !== userId) {
            return loadJSON('https://jsonplaceholder.typicode.com/users/' + userId).then(user => {
                if (!reload) writeStorageData('lastUser', user);
                return user;
            });
        } else {
            return Promise.resolve(user)
        }
    },

    /**
     * Завантаження інформації про пости користувача
     * @param {number} userId ID користувача
     * @param {boolean} reload не використовувати кеш
     * @returns {Promise<UserPost[]>}
     */
    loadPosts (userId, reload = true) {
        const posts = reload ? null : readStorageData('posts', application.expireTime);
        if (!posts || !posts.find(post => post.userId === userId)) {
            return loadJSON(`https://jsonplaceholder.typicode.com/users/${userId}/posts`).then(posts => {
                if (!reload) writeStorageData('posts', posts);
                return posts;
            });
        } else {
            return Promise.resolve(posts)
        }
    },

    /**
     * Адреса із детальною інформацією про користувача
     * @param {number?} id id користувача
     * @returns {string}
     */
    getPath (id = undefined) { return './user-details.html' + (typeof id === 'number' ? '?id=' + id : ''); },

    /**
     * Робота сторінки з детальною інформацією користувача
     * @returns {Promise<application.pages.userDetails>}
     */
    async perform () {
        const url = new URL(location.href);
        const id = url.searchParams.get('id');
        const owner = document.body;
        if (!id) location.href = application.pages.users.getPath();
        owner.classList.add('cursor-progress');
        try {
            const userId = +id;
            const user = await this.loadUserDetails(userId, false);
            if (!user) location.href = application.pages.users.getPath();

            drawBreadCrumbs(owner, [
                { href: application.pages.users.getPath(), title: 'Users' },
                { title: user.name }
            ]);

            this.drawUser(owner, user);
            return this;
        } finally {
            owner.classList.remove('cursor-progress');
        }
    }

}

/**
 * Сторінка з коментарями до посту
 */
application.pages.postDetails = {

    /**
     * Друк повної інформації про пост користувача
     * @param {HTMLElement} owner Елемент, на якому буде виконано друк
     * @param {UserPost} post Дані про пост користувача
     * @param {User} user Дані про користувача
     */
    drawPostDetails (owner, post, user) {
        const layout = makeTag({ className: 'layout' },
            makeTag({ className: 'layout-card' },
                makeTag({ className: 'layout-header', innerHTML: 'post ID#' + post.id }),
                makeTag({ className: 'layout-body' },
                    makeTag({ className: 'layout-row' },
                        makeTag({ className: 'layout-value' },
                            makeTag('a', a => {
                                a.className = 'layout-value';
                                a.href = application.pages.userDetails.getPath(post.userId);
                                a.innerHTML = `${user.name} ID#${post.userId}`;
                            })
                        )
                    ),
                    makeTag({ className: 'layout-header', innerHTML: 'title' }),
                    makeTag({ className: 'layout-row' },
                        makeTag({ className: 'layout-value', innerHTML: post.title })
                    ),
                    makeTag({ className: 'layout-header', innerHTML: 'body' }),
                    makeTag({ className: 'layout-row' },
                        makeTag({ className: 'layout-value', innerHTML: post.body })
                    )
                )
            )
        );
        owner.appendChild(layout);
    },

    /**
     * Друк повної інформації про коментарі до посту користувача
     * @param {HTMLElement} owner Елемент, на якому буде виконано друк
     * @param {UserComment[]} comments Дані про коментарі до посту користувача
     */
    drawComments (owner, comments) {
        const layout = makeTag({ className: 'layout columns-4' });
        comments.forEach(comment => {
            layout.appendChild(
                makeTag({ className: 'layout-card' },
                    makeTag({ className: 'layout-header', innerHTML: 'comment ID#' + comment.id }),
                    makeTag({ className: 'layout-body' },
                        makeTag({ className: 'layout-row' },
                            makeTag({ className: 'layout-value' },
                                makeTag('a', a => {
                                    a.className = 'layout-value';
                                    a.href = 'mailto:' + comment.email;
                                    a.innerHTML = comment.email;
                                })
                            )
                        ),
                        makeTag({ className: 'layout-header', innerHTML: 'name' }),
                        makeTag({ className: 'layout-row' },
                            makeTag({ className: 'layout-value', innerHTML: comment.name })
                        ),
                        makeTag({ className: 'layout-header', innerHTML: 'body' }),
                        makeTag({ className: 'layout-row' },
                            makeTag({ className: 'layout-value', innerHTML: comment.body })
                        )
                    )
                )
            )
        });

        owner.appendChild(layout);
    },

    /**
     * Завантаження інформації про пост користувача
     * @param {number} postId id посту
     * @param {boolean} reload не використовувати кеш
     * @returns {Promise<UserPost>}
     */
    loadPostDetails (postId, reload = true) {
        const post = reload ? null : readStorageData('lastPost', application.expireTime);
        if (!post || post.id !== postId) {
            return loadJSON('https://jsonplaceholder.typicode.com/posts/' + postId).then(post => {
                if (!reload) writeStorageData('lastPost', post);
                return post;
            });
        } else {
            return Promise.resolve(post)
        }
    },

    /**
     * Завантаження інформації про коментарі до постів
     * @param {number} postId ID посту користувача
     * @param {boolean} reload не використовувати кеш
     * @returns {Promise<UserComment[]>}
     */
    loadComments (postId, reload = true) {
        const comments = reload ? null : readStorageData('comments', application.expireTime);
        if (!comments || !comments.find(comment => comment.postId === postId)) {
            return loadJSON(`https://jsonplaceholder.typicode.com/posts/${postId}/comments`).then(comments => {
                if (!reload) writeStorageData('comments', comments);
                return comments;
            });
        } else {
            return Promise.resolve(comments)
        }
    },

    /**
     * Адреса із детальною інформацією про пост
     * @param {number?} id id посту
     * @returns {string}
     */
    getPath (id= undefined) { return './post-details.html' + (typeof id === 'number' ? '?id=' + id : ''); },

    /**
     * Робота сторінки з коментарями до посту
     * @returns {Promise<application.pages.postDetails>}
     */
    async perform () {
        const url = new URL(location.href);
        const id = url.searchParams.get('id');
        const owner = document.body;
        const pages = application.pages;
        if (!id) location.href = pages.users.getPath();
        owner.classList.add('cursor-progress');
        try {
            const postId = +id;
            const wPost = this.loadPostDetails(postId, false);
            const wComments = this.loadComments(postId, false);

            const post = await wPost; // Повільніше - const post = await this.loadPostDetails(id, false);
            const comments = await wComments; // Повільніше - const comments = await this.loadComments(id, false);

            if (!post) location.href = pages.users.getPath();
            const user = await pages.userDetails.loadUserDetails(post.userId, false);

            drawBreadCrumbs(owner,[
                { href: pages.users.getPath(), title: 'Users' },
                { href: pages.userDetails.getPath(post.userId), title: user.name },
                { title: post.title }
            ]);

            this.drawPostDetails(owner, post, user);
            this.drawComments(owner, comments);
            return this;
        }
        finally {
            owner.classList.remove('cursor-progress');
        }
    }
}

