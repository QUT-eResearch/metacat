// search related functions
function trim(stringToTrim) {
  return stringToTrim.replace(/^\s*/, '').replace(/\s*$/,'');
}

function allowSearch(formObj) {
  var canSearch = true;
  var searchString = trim(formObj.elements["anyfield"].value);
  if (searchString=="") {
    if (confirm("Show *all* data in the Catalog?\n(this may take some time!)            ")) {
      formObj.elements["anyfield"].value = "%";
      canSearch = true;
    } else {
      formObj.elements["anyfield"].focus();
      canSearch = false;
    }
  } 
  return canSearch;
}

function keywordSearch(formObj, searchKeyword) {
  var searchString = trim(searchKeyword);
  if (searchString=="") searchString="%";
  formObj.anyfield.value = searchString;

  if(checkSearch(formObj)){
    formObj.submit();
  }
  return true;
}

function validateSearchForm() {
  var searchBox = document.getElementById("searchBox");
  var searchString = trim(searchBox.value);
  if (searchString=="") {
    if (confirm("Show *all* data in the KNB?")) {
      searchString = "%";
    } else {
      return false;
    }
  }
  searchBox.value = searchString;

  var submitFormObj = $("#searchForm").get(0);
  var searchRadio = $("input:radio[name=search]:checked");
  var searchType = document.getElementById("searchType");
  var searchBox = $("#searchBox");
  var searchString = searchBox.val();
  var fieldValue;
  if(searchRadio.val()=="quick" && searchString!="%") {
    searchType.name = "title";
    submitFormObj.operator.value="UNION";
    fieldValue = searchString;
  } else {
    searchType.name = "anyfield";
    submitFormObj.operator.value="INTERSECT";
    fieldValue = "";
  }
  searchType.value = searchString;
  submitFormObj.surName.value = fieldValue;
  submitFormObj.givenName.value = fieldValue;
  submitFormObj.keyword.value = fieldValue;
  submitFormObj.organizationName.value = fieldValue;
  submitFormObj.para.value = fieldValue;
  submitFormObj.geographicDescription.value = fieldValue;
  submitFormObj.literalLayout.value = fieldValue;
  $("#abstract").val(fieldValue);
  
  var search = $("input[name=search]");
  search.attr("name","");
  searchBox.attr("name","");
  
  return true;
}

function updateLoginForm(data) {
  var loginform = document.forms["loginform"];
  if (loginform) {
    $("#loginStatus").text(data.loginStatus);
    if (data.isLoggedIn) {
      loginform.username.value = data.username;
      loginform.password.value = data.password;
      loginform.username.disabled = true;
      loginform.password.disabled = true;
      loginform.q.value = LOGOUT_LABEL;
    } else {
      loginform.username.value = "";
      loginform.password.value = "";
      loginform.username.disabled = false;
      loginform.password.disabled = false;
      loginform.q.value = LOGIN_LABEL;
    }
    $("#searchFormSessionId").val(data.sessionId);
  }
}

var authurl = SKIN_URL + "/auth.jsp";

function allowLoginSubmit(formObj) {
  var popupMsg = "If you need to create a new account, please contact us.";

  if (trim(formObj.elements["q"].value)!=LOGIN_LABEL) {
    //do logout
    $.ajax({type:"POST", url:authurl, data: {"q":formObj.elements["q"].value}, dataType:"json", success: function(data) {
      updateLoginForm(data);
    }});

  } else {
    //trim username & passwd:
    var username = trim(formObj.elements["username"].value);
    var organization = trim(formObj.elements["organization"].value);
    var password = trim(formObj.elements["password"].value);
    if (username=="") {
      alert("You must type a username. \n"+popupMsg);
      formObj.elements["username"].focus();
      return false;
    } 
    if (organization=="") {
      alert("You must select an organization.\n"+popupMsg); 
      formObj.elements["organization"].focus();
      return false;
    }
    if (password=="") {
      alert("You must type a password. \n"+popupMsg);
      formObj.elements["password"].focus();
      return false;
    }
    //do login
    $.ajax({type:"POST", url:authurl, data: {"q":formObj.elements["q"].value, "username":username, "password":password, "organization":organization}, dataType:"json", success: function(data) {
      updateLoginForm(data);
    }});
    
  }
  
  return false;
}

$(document).ready(function(){
  if ($('#mapArea').length == 1) {
    initMap(document.forms["mapForm"]);
  }
  
  var loginform = document.forms["loginform"];
  if (loginform) {
    $.ajax({type:"GET", url: authurl, dataType:"json", success: function(data) {
      updateLoginForm(data);
    }});
  }
  if ($('#tabs').length == 1) {
    if ($('#tabData').length == 1) {
      $('.emlDownload').appendTo('#tabData');
      $('.datasetEntity').appendTo('#tabData');
    }
    $('#tabs').tabs();
  }
});