const baseURL = "/api";

const reqPOST = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: {},
};

const reqPUT = {...reqPOST, method: 'PUT'};
const reqDELETE = { method: 'DELETE' };

const parserError = { param: "Application", log: "Cannot parse server response" };
const connectionError = { param: "Server", log: "Cannot communicate" }


export function queryParamsStringfy(params) {
    var query = "";
    if (params) {
        var str = [];
        Object.keys(params).map(key => {
            if (params[key])
                str.push(key +"=" + params[key])
        })
        query = "?" + str.join("&");
    }
    return query;
}

function pathParamsStringfy(params){
    var path = "";

    if (params) {
        var str = [];
        Object.keys(params).map(key => {
            if (params[key])
                str.push(params[key])
        })
        path = str.join("/");
    }
    return path;
}

function getCookie(name) {
    var csrftoken = null;
    var elem = document.querySelector('[name=' + name + ']');

    if (elem) {
        csrftoken = elem.value;
    }
    
    return csrftoken;
}

async function fetchData(url, init) {
    var csrftoken = getCookie('csrfmiddlewaretoken');
    init = {...init, headers: {...init.headers, 'X-CSRFToken': csrftoken}}
    return new Promise((resolve, reject) => {
        fetch(baseURL + url, init)
            .then((response) => {
                if (response.ok) {
                    if (response.redirected) {
                        window.location.href = response.url;
                    } else {
                        response.json()
                        .then((data) => {
                            resolve(data);
                        })
                        .catch(() => {
                            resolve(true);
                        });
                    }
                } else {
                    // analyze the cause of error
                    response.json()
                        .then((error) => reject(error))
                        .catch((err) => reject({ errors: [{...parserError, err }] }));
                }
            })
            .catch((err) => reject({ errors: [{...connectionError, err }] }));
    });
}

async function getData(url) {
    // I'm using standard fetch data, not mine encapsulation for having different manipulation at higher level
    return fetch(baseURL + url)
}

async function postData(url, body= {}) {
    return fetchData(url, {...reqPOST, body: JSON.stringify(body)});
}

async function putData(url, body = {}) {
    return fetchData(url, {...reqPUT, body: JSON.stringify(body)});
}

async function deleteData(url) {
    return fetchData(url, reqDELETE);
}

export function getErrorObj(response, log) {
    console.log(response);
    return { status: response.status, log: log };
}

const HTTP = { getData, postData, putData, deleteData } ;
export default HTTP;
