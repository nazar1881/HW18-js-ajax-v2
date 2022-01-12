let input = document.getElementById('inputText');
let ul = document.getElementById('list');
let findLiValue = document.getElementById('find');
let createBtn = document.getElementById('createBtn');

let requestURL = 'http://localhost:3000/todos';

const sendGETRequest = function (requestURL) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open('GET', requestURL, true);

        xhr.responseType = 'json';

        xhr.onload = () => {
            if (xhr.status >= 400) {
                reject(xhr.response)
            } else {
                resolve(xhr.response)
            }
        }
        xhr.send();
    })
}

const sendPOSTRequest = function (requestURL, todoBody) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open('POST', requestURL);

        xhr.responseType = 'json';
        xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8')

        xhr.onload = () => {
            if (xhr.status >= 400) {
                reject(xhr.response)
            } else {
                resolve(xhr.response)
            }
        }

        xhr.onerror = () => {
            reject(xhr.response)
        }

        xhr.send(JSON.stringify(todoBody))
    })
}

const sendPutRequest = function (requestURL, data) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();

        xhr.open('put', requestURL, true);
        xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');

        xhr.responseType = 'json';

        xhr.onload = () => {
            if (xhr.status >= 400) {
                reject(xhr.response)
            } else {
                resolve(xhr.response)
            }
        }

        xhr.onerror = function (e) {
            reject('Error fetching ' + url);
        };

        xhr.send(JSON.stringify(data));
    });
};

const sendDeleteRequest = function (requestURL) {
    return new Promise(function (resolve, reject) {
        let xhr = new XMLHttpRequest();

        xhr.open('delete', requestURL, true);
        xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');

        xhr.responseType = 'json';

        xhr.onload = function () {
            let status = xhr.status;

            resolve(xhr.response);
        };

        xhr.onerror = function (e) {
            reject('Error fetching ' + url);
        };

        xhr.send(null);
    });
};

class TodoList {
    constructor(el) {
        this.el = el;
        this.el.addEventListener('click', (event) => {
            let target = event.target;
            let todoId = target.closest('li').dataset.id;

            if (target.className.includes('set-status')) {
                todo.changeTodoStatus(todoId);
            } else if (target.className.includes('delete-task')) {
                todo.removeTodo(todoId);
            }
        });
    }

    async getJSONData() {
        try {
            let data = await sendGETRequest("http://localhost:3000/todos");
            return data;
        } catch (error) {
            console.log(new Error(error));
        }
    }

    render() {
        let lis = '';
        this.getJSONData()
            .then((data) => {
                for (let item of data) {
                    if (!item) {
                        return
                    } else {
                        lis +=
                            `<li class="not-done ${item.complited ? "done" : "not-done"}" data-id="${item.id}">${item.task}<button class="set-status">Change status</button><button class="delete-task"></button></li>`
                    }
                }
                this.el.innerHTML = lis
            })
            .catch(error => error)
    }

    async addTodo() {
        try {
            if (input.value !== '') {
                await sendPOSTRequest('http://localhost:3000/todos', {
                    task: input.value,
                    complited: false,
                });
                this.render();
            }
            
        } catch (error) {
            console.log(error);
        }
    }

    async changeTodoStatus(id) {
        try {
            let data = await sendGETRequest('http://localhost:3000/todos');

            for (let item of data) {
                if (item.id == id) {
                    item.complited = !item.complited;
                    let todoToChangeStatus = document.querySelector(`[data-id="${id}"]`);

                    this.changeTodoColor(todoToChangeStatus);

                    sendPutRequest(`${requestURL}/${id}`, {
                        task: item.task,
                        complited: item.complited,
                    });
                }
            }
        } catch (error) {
            console.log(new Error(error));
        }
    }

    changeTodoColor(el) {
        el.classList.toggle('done');
    }

    async removeTodo(id) {
        try {
            let data = await sendGETRequest('http://localhost:3000/todos');

            for (let item of data) {
                if (item.id == id) {
                    sendDeleteRequest(`${requestURL}/${id}`);
                }  
                this.render();     
            }
        } catch (error) {
            console.error(error);
        }
    }
}

let todo = new TodoList(ul);

todo.render();

createBtn.addEventListener('click', function() {
    todo.addTodo();
    input.value = "";
});