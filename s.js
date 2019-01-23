var gmailNode = require('gmail-node');
var clientSecret = {installed:{
    client_id:"133586172988-mluc0qbict30ok3rmrrdbla1mv9df433.apps.googleusercontent.com",
    project_id:"inc-ognito",
    auth_uri:"https://accounts.google.com/o/oauth2/auth",
    token_uri:"https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url:"https://www.googleapis.com/oauth2/v1/certs",
    client_secret:"__DNkR9rqfgeB3sZz-NH8fW7",
    redirect_uris:["urn:ietf:wg:oauth:2.0:oob","http://localhost"]}};
    gmailNode.init(clientSecret, './token.json', function(err,data){ });
    var emailMessage = {
    to: '1606295@kiit.ac.in',
    subject: 'Test Subject Madarchoddsfsnfskf a,gsngksbgksbkgsbkgskgksgksgkbzgkkvbafvjabvkabv',
    message: '<h1>Test Email</h1>'
};
 gmailNode.sendHTML(emailMessage, function (err, data){});