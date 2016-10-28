package org.jala.efeeder.places;

import lombok.Data;

@Data
public class ItemPlace {
	private int id;
	private String name;
	private String description;
	private double price;
	private String imageLink;
	private Place place; 

	public ItemPlace(String name, String description, double price, String imageLink, Place place) {
		this.name = name;
		this.description = description;
		this.price = price;
		this.imageLink = imageLink;
		this.place = place;
	}
}
