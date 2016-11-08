package org.jala.efeeder.places;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(exclude={"name", "description", "price", "imageLink", "place"})
public class PlaceItem {
	private int id;
	private String name;
	private String description;
	private double price;
	private String imageLink;
	private Place place; 

	public PlaceItem(String name, String description, double price, String imageLink, Place place) {
		this.name = name;
		this.description = description;
		this.price = price;
		this.imageLink = imageLink;
		this.place = place;
	}
	public PlaceItem(int id, String name, String description, double price, String imageLink, Place place) {
		this(name, description, price, imageLink, place);
		this.id = id;
	}
	
	public String toString() {
		return name;
	}
}
