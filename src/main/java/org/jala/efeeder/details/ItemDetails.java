/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.details;

import java.util.ArrayList;
import java.util.List;
import lombok.Data;

/**
 *
 * @author alexander_castro
 */
@Data
public class ItemDetails {

	private String name;
	private double price;
	private int quantity;
	private List<String> detailsFromItem;
	private double totalCost;

	public ItemDetails(String name, double price, int quantity, List<String> detailsFromItem, double totalCost) {
		this.name = name;
		this.price = price;
		this.quantity = quantity;
		this.detailsFromItem = detailsFromItem;
		this.totalCost = totalCost;
	}

	public ItemDetails() {
		this.name = "";
		this.price = 0;
		this.quantity = 0;
		this.detailsFromItem = new ArrayList<String>();
		this.totalCost = 0;
	}

	public String getListOfDetails() {
		String resp = "";

		for (String detail : detailsFromItem) {
			resp += "- " + detail + "\n";
		}

		return resp;
	}

	public double getTotalCost() {
		return roundTwoDecimals(totalCost);
	}

	private double roundTwoDecimals(double number) {
		number = Math.round(number * 100);
		number = number / 100;
		return number;
	}
}
