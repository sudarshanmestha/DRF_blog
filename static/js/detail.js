const root = document.getElementById('root');

const title = document.getElementById('title');  
const content = document.getElementById('content');  
const author = document.getElementById('author');

const pathname = window.location.pathname;
const pathnameParts = pathname.split('/');
const postID = pathnameParts[pathnameParts.length - 2];

document.querySelector('#postForm').addEventListener('submit', e => {
    e.preventDefault(); // Prevents the default form submission behavior
    updatePost(title.value, content.value, author.value);
    title.value = '';
    content.value = '';
    author.value = '';
    
});

function getAuthor(authorID){
    fetch(`/api/posts/author/${authorID}/`)
    .then(res => res.json())
    .then(data => {
        appendAuthor(data);
    })
    .catch(err => {
        console.error(err);
    })
}

function getPost(postID){
    fetch(`/api/posts/${postID}/`)
    .then(res => res.json())
    .then(data => {
        prepopulatedForm(data);
        clearChildren(root);
        renderPost(data);
        getAuthor(data.author);
    })
    .catch(err => {
        console.error(err);
    })
}

function getCSRFToken() {
    const csrfCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('csrftoken='));
    if (csrfCookie) {
        return csrfCookie.split('=')[1];
    }
    return null;
}
function updatePost(title, content, author){
    const csrfToken = getCSRFToken();

    const data = {
        method: "PUT",
        headers: {
            'content-type': "application/json",
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            title, content, author
        })
    }
    fetch(`/api/posts/${postID}/update/`, data)
    .then(() => {
        getPost(postID)
    })
    .catch(err => {
        console.error(err);
    })

}

function deletePost(postID){
    const csrfToken = getCSRFToken();

    const data = {
        method: "DELETE",
        headers: {
            'content-type': "application/json",
            'X-CSRFToken': csrfToken
        }
    }
    fetch(`/api/posts/${postID}/delete/`, data)
    .then(() => {
        window.location='/';
    })
    .catch(err => {
        console.error(err);
    })

}



function prepopulatedForm(data){
    title.value = data.title;
    content.value = data.content;
    author.value = data.author;

}


function createNode(element){
    return document.createElement(element);
}
function append(parent, el){
    return parent.appendChild(el)
}
function clearChildren(node) {
    while(node.firstChild) {
        node.removeChild(node.firstChild);
    }
}
function renderPost(post){
    const div = createNode('div');
    div.className = 'post-item'
    const title = createNode('h2');
    title.className = 'post-title'
    const content = createNode('p');
    const publishDate = createNode('span');
    const lastUpdated = createNode('span');


    title.innerText = post.title;
    content.innerText = post.content;
    publishDate.innerText =`Published: ${new Date(post.publish_date).toUTCString()} `;
    lastUpdated.innerText =`Last Updated: ${new Date(post.updated).toUTCString()} `;

    append(div, title);
    append(div, content);
    append(div, publishDate);
    append(div, lastUpdated);
    append(root, div)
    appendDeleteBtn(post);
}

function appendAuthor(data){
    const title = document.querySelector('.post-title');
    const author = createNode('small');

    author.innerText = ` written by ${data.username}`;
    append(title, author);
}

function appendDeleteBtn(post) {
    const postDiv = document.querySelector('.post-item');
    const deleteBtn = createNode('button');
    deleteBtn.className = 'post-delete-button';
    deleteBtn.innerText = 'Delete';
    deleteBtn.addEventListener('click', e => {
        deletePost(post.id);

    });
    append(postDiv, deleteBtn);
    
}

getPost(postID);
