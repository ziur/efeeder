<%@tag description="Order Item Information" pageEncoding="UTF-8" %>
<%@taglib prefix="t" tagdir="/WEB-INF/tags" %>


<div class="row">
	<li class="collection-item avatar">
		<div class="row center-align">
			<h6 id="message-order" class='center lighten-1 grey-text'>Please add your orders.</h6>
		</div>
		<div id="my-order-container">
			<i class="material-icons circle">perm_identity</i>
			<input type="hidden" id="id-place-item"/>
			<input class="input-field col s1 m1 l1" type="number" id="my-order-quantity" value="" placeholder="Quantity" />
			<input class="input-field col s7 m8 l9" type="text" id="my-order-name" value="" placeholder="Order Name" disabled="true" />
			<input class="input-field col s1 m1 l1" type="number" id="my-order-cost-input" value="" placeholder="Cost" disabled="true"/>
			<input class="input-field col s9 m10 l11" type="text" id="my-order-text" value="" placeholder="Details" />

			<div class="btn-edit secondary-content">
				<a href="#" id="btn-edit-my-order">
					<i class="material-icons">search</i>
				</a>
				<a href="#" id="btn-add-my-order">
					<i class="material-icons">add_circle</i>
				</a>
			</div>
		</div>
	</li>
</div>