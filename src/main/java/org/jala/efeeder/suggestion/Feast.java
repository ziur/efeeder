/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.suggestion;

import java.sql.Timestamp;
import lombok.Data;

/**
 *
 * @author 0x3
 */
@Data
public class Feast {
	private int ownerId;
	private String ownerName;
	private String name;
	private String imgSrc;
	private Timestamp eventTime;
	private Timestamp voteTime;
	private Timestamp orderTime;
	private Timestamp payTime;
	
    public Feast(int ownerId, String ownerName, String name, String imgSrc, Timestamp eventTime,
			Timestamp voteTime, Timestamp orderTime, Timestamp payTime)
	{
		this.ownerId = ownerId;
		this.ownerName = ownerName;
		this.name = name;
		this.imgSrc = imgSrc;
		this.eventTime = eventTime;
		this.voteTime = voteTime;
		this.orderTime = orderTime;
		this.payTime = payTime;
	}
}
