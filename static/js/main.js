const root = document.getElementById('root')


document.querySelector('#postForm').addEventListener('submit', e => {
    e.preventDefault(); // Prevents the default form submission behavior
    const title = document.getElementById('title');  
    const content = document.getElementById('content');  
    const author = document.getElementById('author');
    createPost(title.value, content.value, author.value);
    title.value = '';
    content.value = '';
    author.value = '';
    
});

function getCSRFToken() {
    const csrfCookie = document.cookie.split(';').find(cookie => cookie.trim().startsWith('csrftoken='));
    if (csrfCookie) {
        return csrfCookie.split('=')[1];
    }
    return null;
}

function createPost(title, content, author) {
    const csrfToken = getCSRFToken();

    const data = {
        method: "POST",
        headers: {
            'content-type': "application/json",
            'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({
            title, content, author
        })
    }
    fetch('/api/posts/create/', data)
    .then(() => {
        getPostList();
    })
    .catch(err => {
        console.error(err);
    })
}

function getPostList(){
    fetch('/api/posts/')
    .then(res => res.json())
    .then(data => {
        clearChildren(root);
        renderPosts(data);
    })
    .catch(err => {
        console.error(err);
    })
}

function renderPosts(data) {
    return data.map(post => {
        renderPost(post);
    })
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
    const link = createNode('a');
    link.href = `/posts/${post.id}/`;
    const title = createNode('h2');
    append(link, title);
    const content = createNode('p');
    const publishDate = createNode('span');
    const lastUpdated = createNode('span');
    const author = createNode('small');

    author.innerText = ` written by ${post.author}`;
    title.innerText = post.title;
    append(title, author);
    content.innerText = post.content;
    publishDate.innerText =`Published: ${new Date(post.publish_date).toUTCString()} `;
    lastUpdated.innerText =`Last Updated: ${new Date(post.updated).toUTCString()} `;

    append(div, link);
    append(div, content);
    append(div, publishDate);
    append(div, lastUpdated);
    append(root, div);
}



getPostList()