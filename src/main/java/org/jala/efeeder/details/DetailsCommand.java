package org.jala.efeeder.details;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.ArrayList;
import java.sql.Timestamp;
import java.util.List;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.MockCommandUnit;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;
import org.jala.efeeder.api.command.impl.DefaultOut;
import org.jala.efeeder.foodmeeting.FoodMeeting;
import org.jala.efeeder.foodmeeting.FoodMeetingManager;
import org.jala.efeeder.order.Order;
import org.jala.efeeder.order.OrderManager;
import org.jala.efeeder.payment.ItemPaymentManager;
import org.jala.efeeder.payment.PaymentItem;
import org.jala.efeeder.places.Place;
import org.jala.efeeder.places.PlaceItem;
import org.jala.efeeder.places.PlaceItemManager;
import org.jala.efeeder.places.PlaceManager;
import org.jala.efeeder.user.Buyer;
import org.jala.efeeder.user.BuyerManager;
import org.jala.efeeder.user.User;
import org.jala.efeeder.user.UserManager;

/**
 *
 * @author alexander_castro
 */
@Command
public class DetailsCommand extends MockCommandUnit {
    
	@Override
	public Out execute(In parameters) {
		Out out = new DefaultOut();
		int idFoodMeeting = Integer.parseInt(parameters.getParameter("id_food_meeting"));
		Connection connection = parameters.getConnection();

		List<Order> orderList;
		try {
			List<PaymentItem> itemList = getExtraItems(idFoodMeeting, connection);

			orderList = getOrders(connection, idFoodMeeting);
			List<User> usersWithOrders = getUsersWithOrders(connection, idFoodMeeting);
			double itemTotalPrice = getTotalExternalItemPrice(itemList);
			double partialByOrder = getSharedPriceByUser(itemTotalPrice, usersWithOrders != null ? usersWithOrders.size() : 0);

			Buyer buyer = getBuyerId(idFoodMeeting, connection);

			out.addResult("buyer", getBuyer(buyer, orderList));
			out.addResult("food_meeting", getFoodMeeting(connection, idFoodMeeting));
			out.addResult("orders", orderList);
			out.addResult("place", getPlace(idFoodMeeting, connection));
			out.addResult("extra_items_by_users", roundTwoDecimals(partialByOrder));
			out.addResult("extra_items_list", itemList);
			out.addResult("extra_items_total_price", itemTotalPrice);
			out.addResult("buyer_details", buildItemDetails(connection, orderList, itemList));
			out.addResult("payment", roundTwoDecimals(getPaymentByUsers(usersWithOrders)));
			out.addResult("total_extra_item_price", itemTotalPrice);
			out.addResult("food_meeting_totalCost", getTotalCostFromFoodMeeting(orderList, partialByOrder));
			out.addResult("paymentTime", getPaymentTime(connection, String.valueOf(idFoodMeeting)));
			out.addResult("usersWithOrders", usersWithOrders);

			return out.forward("details/details.jsp");
		} catch (Exception ex) {
			return OutBuilder.response("text/plain", ex.getMessage());
		}
	}

	private Buyer getBuyerId(int idFoodMeeting, Connection connection) throws Exception {

		try {
			BuyerManager buyerManager = new BuyerManager(connection);
			return buyerManager.getBuyerByFoodMeetingId(idFoodMeeting);
		} catch (SQLException ex) {
			throw new Exception("Failed to get buyer from database : " + ex.toString());
		}
	}

	private FoodMeeting getFoodMeeting(Connection connection, int idFoodMeeting) throws Exception {
		try {
			FoodMeetingManager foodMeetingManager = new FoodMeetingManager(connection);
			return foodMeetingManager.getFoodMeetingById(idFoodMeeting);
		} catch (SQLException ex) {
			throw new Exception("Failed to get food meeting from database : " + ex.toString());
		}
	}

	private List<Order> getOrders(Connection connection, int idFoodMeeting) throws Exception {
		OrderManager orderManager = new OrderManager(connection);
		try {
			return orderManager.getOrdersWithUserByFoodMeeting(idFoodMeeting);
		} catch (SQLException ex) {
			throw new Exception("Failed to get orders from database : " + ex.toString());
		}
	}

	private Place getPlace(int idFoodMeeting, Connection connection) throws Exception {
		try {
			PlaceManager placeManager = new PlaceManager(connection);
			FoodMeeting foodMeeting = new FoodMeeting();
			foodMeeting.setId(idFoodMeeting);
			return placeManager.getPlaceByFoodMeeting(foodMeeting);
		} catch (SQLException ex) {
			throw new Exception("Failed to get place from database : " + ex.toString());
		}
	}

	private User getBuyer(Buyer buyer, List<Order> orders) {
		for (Order order : orders) {
			User user = order.getUser();
			if (user.getId() == buyer.getUserId()) {
				return user;
			}
		}

		return null;
	}

	private List<PaymentItem> getExtraItems(int idFoodMeeting, Connection connection) throws Exception {
		List<PaymentItem> resultItemsList = new ArrayList<>();
		ItemPaymentManager itemManager = new ItemPaymentManager(connection);

		try {
			resultItemsList = itemManager.getPaymentItemByFoodMeeting(idFoodMeeting);
		} catch (SQLException ex) {
			throw new Exception("Throw a problem when we wont work with payments table : " + ex.getMessage());
		}

		return resultItemsList;
	}

	private double getTotalExternalItemPrice(List<PaymentItem> itemList) {
		double resp = 0;

		for (PaymentItem paymentItem : itemList) {
			resp += paymentItem.getPrice();
		}

		return resp;
	}

	private List<ItemDetails> buildItemDetails(Connection connection, List<Order> orders, List<PaymentItem> itemList) {
		List<ItemDetails> itemDetailsList = new ArrayList<>();
		PlaceItemManager placeItemManager = new PlaceItemManager(connection);

		for (Order order : orders) {
			int index = searchPlaceItem(itemDetailsList, order.getPlaceItem());
			if (index >= 0) {
				ItemDetails itemDetails = itemDetailsList.get(index);
				itemDetails.setQuantity(itemDetails.getQuantity() + order.getQuantity());
				itemDetails.setTotalCost(itemDetails.getTotalCost() + order.getTotalCost());
				if (!order.getDetails().isEmpty()) {
					itemDetails.getDetailsFromItem().add(order.getDetails());
				}
			} else {
				String detailOrder = order.getDetails();
				List<String> listOfDetail = new ArrayList<String>();
				listOfDetail.add(detailOrder);
				itemDetailsList.add(new ItemDetails(order.getPlaceItem().getName(),
						order.getPlaceItem().getPrice(),
						order.getQuantity(),
						listOfDetail,
						order.getPlaceItem().getPrice()));

			}
		}

		for (PaymentItem extraItem : itemList) {
			itemDetailsList.add(new ItemDetails(extraItem.getDescription(),
					extraItem.getPrice(),
					1,
					new ArrayList<String>(),
					extraItem.getPrice()));
		}

		return itemDetailsList;
	}

	private int searchPlaceItem(List<ItemDetails> itemDetailsList, PlaceItem placeItem) {
		int index = 0;
		for (ItemDetails itemDetails : itemDetailsList) {
			if (itemDetails.getName().equals(placeItem.getName())) {
				return index;
			}
			index++;
		}
		return -1;
	}

	private double getTotalCostFromFoodMeeting(List<Order> orderList, double extraItem) {
		double resp = 0;

		for (Order order : orderList) {
			resp += (order.getTotalCost() + extraItem);
		}

		return resp;
	}

	private double getPaymentByUsers(List<User> userList) {
		double paymentRes = 0;
		for (User user : userList) {
			paymentRes += user.getPayment();
		}
		return paymentRes;
	}

	private double roundTwoDecimals(double number) {
		number = Math.round(number * 100);
		number = number / 100;
		return number;
	}

	private Timestamp getPaymentTime(Connection connection, String idFoodMeeting) throws SQLException {
		FoodMeetingManager foodMeetingManager = new FoodMeetingManager(connection);
		return foodMeetingManager.getFoodMeetingById(Integer.parseInt(idFoodMeeting)).getPaymentDate();
	}
	
	private List<User> getUsersWithOrders(Connection connection, int idFoodMeeting) throws SQLException {
		UserManager userManager = new UserManager(connection);
		return userManager.getUsersWithOrders(idFoodMeeting);
	}
	
	private double getSharedPriceByUser(double itemTotalPrice, int usersSize) {
		return itemTotalPrice > 0 && usersSize > 0 ? itemTotalPrice / usersSize : 0.0;
	}
}
