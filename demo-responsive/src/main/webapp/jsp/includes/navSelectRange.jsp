<%@include file="tags.jsp"%>
<c:set var="elements" value="0"/>
<c:set var="select">

<select onchange="$('#refinements').val($('#refinements').val() + '~' + $(this).val());$('#form').submit();">
  <option disabled="disabled" selected="selected">${nav['displayName'] }</option>
  <c:forEach items="${nav.refinementValues}" var="value">
    <c:if test="${value['count'] > 0}">
      <c:set var="elements" value="${elements + 1}"/>
      <option value="<c:out value="${(nav['name'])}"/>:<c:out value="${value['low']}"/>..<c:out value="${value['high']}"/>">
        <fmt:formatNumber pattern="0.00">${value['low']}</fmt:formatNumber> 
        ${empty value['high'] ? '+' : '-'} 
        <fmt:formatNumber pattern="0.00">${value['high']}</fmt:formatNumber>
        (${value['count'] })
      </option>
    </c:if>
  </c:forEach>
</select>
</c:set>

<c:if test="${elements > 1}">
${select}
</c:if>