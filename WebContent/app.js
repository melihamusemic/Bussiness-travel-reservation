sap.ui.localResources("assignment");
var app = new sap.m.App("appid", {
	initialPage : "idlogin1"
});
var loginPage = sap.ui.view({
	id : "idlogin1",
	viewName : "assignment.views.login",
	type : sap.ui.core.mvc.ViewType.XML
});
var employeePage = sap.ui.view({
	id : "idemployee1",
	viewName : "assignment.views.employee",
	type : sap.ui.core.mvc.ViewType.XML
});
var managerPage = sap.ui.view({
	id : "idmanager1",
	viewName : "assignment.views.manager",
	type : sap.ui.core.mvc.ViewType.XML
});
var adminPage = sap.ui.view({
	id : "idadmin1",
	viewName : "assignment.views.admin",
	type : sap.ui.core.mvc.ViewType.XML
});

app.addPage(loginPage);
app.addPage(employeePage);
app.addPage(managerPage);
app.addPage(adminPage);

app.placeAt("content");