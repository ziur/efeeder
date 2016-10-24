/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.payment;

import lombok.Data;

/**
 *
 * @author alexander_castro
 */
@Data
public class PaymentItem {
	private int foodMeetingId;
	private String name;
	private String description;
	private float price;

	public PaymentItem() {
	}

	public PaymentItem(int foodMeetingId, String name, String description, float price) {
		this.foodMeetingId = foodMeetingId;
		this.name = name;
		this.description = description;
		this.price = price;
	}
}
