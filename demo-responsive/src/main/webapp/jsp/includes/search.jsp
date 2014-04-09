<script>
function removeTab()
{
	document.getElementById("tab").remove();
	document.getElementById("q").remove();
	document.getElementById("q1").name='q';
}
</script>

<form id="form" name="form" action="<c:url value="index.html"/>" accept-charset="UTF-8" class="header-search" onKeyDown="removeTab()">
<fieldset>
	 <% if(request.getParameter("tab") == null) { %>
		<input autocomplete="off" type="text" onkeydown="$('#refinements').val('')" name="q" id="q" class="cursorFocus" value="<c:out value="${param.q}"/>">
     <% } else { %>
     	<input autocomplete="off" type="text" onkeydown="$('#refinements').val('')" name="q1" id="q1" class="cursorFocus" value="<c:out value="${param.q1}"/>">
     	<input type="hidden" name="q" id="q" value="<c:out value="${param.q}"/>">
     <% } %>
     <button><i class="icon-search"></i></button>
</fieldset>
  <input type="hidden" name="refinements" id="refinements" value="<c:out value="${param.refinements }"/>">
  <input type="hidden" name="p" id="p" value="0">
  <% if(request.getParameter("tab") != null) { %>
  		<input type="hidden" name="tab" id="tab" value="${param.tab}">
  <% } %>
  
  <input type="hidden" name="region" id="region" value="${param.region}">
</form>

<script>
  $('#q').sayt({
    source: function(request, response) {
      $.getJSON('http://quickstart.groupbyinc.com/sayt/autocomplete?callback=?', { q:request.term, si:5, ni:4 }, response);
    },
    focus: function(event, ui) {
	  event.preventDefault();
	  if (ui.item.type == 'autocorrect') {
	    searchProduct(ui.item.value);
	  } else if (ui.item.type == 'navigation') {
		searchProduct('*', '~' + ui.item.category + '=' + ui.item.value); 
	  }
	},
	select: function(event, ui) {
	  event.preventDefault();
	  if (ui.item.type == 'autocorrect') {
		  $('#q').val(ui.item.value);
	  	$('#form').submit();
	  } else if (ui.item.type == 'navigation') {
		$('#q').val('');
		$('#refinements').val($('#refinements').val() + '~' + ui.item.category + '=' + ui.item.value);
		$('#form').submit()
	  } else if (ui.item.type == 'product') {
		// add product search here
	  }
    }
  });
  
  function searchProduct(searchTerm, refinements) {
    $.getJSON('http://quickstart.groupbyinc.com/sayt/productSearch?callback=?', { c:'bestbuy', q:searchTerm, r:refinements, pi:5 }, function(data) {
	  dust.render('productTemplate.dust', { items:data }, function(err, out) {
  	    $('.sayt-product-content').remove();
  		$('#sayt-menu').append(out);
  	  });
    });
  }
</script>