<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c" %>
<!-- Passes through oVirt SSO and redirects while populating SSO token -->
<!-- Example:redirectUrl=https://engine.local/ovirt-engine/web-ui/authorizedRedirect.jsp?redirectUrl=https://192.168.122.101:9090/machines?token=TOKEN -->
<%
    String result = "redirect not set";
    String redirectUrl = request.getParameter("redirectUrl");
    redirectUrl = (redirectUrl != null) ? redirectUrl : request.getParameter("redirect_uri"); // ovirt-cockpit-sso

    if (redirectUrl != null) {
        String token = ((java.util.Map<String, String>) (request.getSession().getAttribute("userInfo"))).get("ssoToken");
        result = java.net.URLDecoder.decode(redirectUrl, "UTF-8");
        result = result.replace("__hash__", "#");
        result = result.replace("TOKEN", token);
        response.sendRedirect(result);
    }
%>
<%= result %>

