/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.tyche;

import lombok.Data;

/**
 *
 * @author 0x3
 */
@Data
public class DrawnLot {
	private int userId;
	private String name;
	private String lastName;
	private int dice;

	public DrawnLot(int userId, String name, String lastName, int dice) {
		this.userId = userId;
		this.name = name;
		this.lastName = lastName;
		this.dice = dice;
	}
}