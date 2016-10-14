/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.image;

import com.sun.org.apache.xerces.internal.impl.dv.util.Base64;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import javax.imageio.IIOException;
import javax.imageio.ImageIO;
import org.apache.commons.io.FilenameUtils;
import org.jala.efeeder.api.command.Command;
import org.jala.efeeder.api.command.CommandUnit;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.Out;
import org.jala.efeeder.api.command.OutBuilder;

/**
 *
 * @author alexander_castro
 */
@Command
public class ImageCommand implements CommandUnit {
	private static final String USER_IMG_PATH = "/assets/img/empty_user.jpeg";
	private static final String PLACE_IMG_PATH = "/assets/img/empty_place.jpeg";
	private static final String FOOD_MEETING_IMG_PATH = "/assets/img/empty_food.jpeg";
	
	private String defaultPath = "";

	@Override
	public Out execute(In parameters) throws Exception {
		String imageName = parameters.getParameter("file_name");

		String type = parameters.getParameter("type");

		String path = parameters.getContext().getRealPath("/") + getEmptyImagePath(type);

		this.defaultPath = path;

		if (!imageName.equals("empty")) {
			path = parameters.getParameter("image_path") + "/" + imageName;
		}

		String extension = FilenameUtils.getExtension(path);
		switch(extension){
			case "gif":
				return readImageAndConvertToBytes(path, "gif", "image/gif");
			case "png":
				return readImageAndConvertToBytes(path, "png", "image/png");
			default:
				return readImageAndConvertToBytes(path, "jpg", "image/jpeg");
		}
	}
	
	private Out readImageAndConvertToBytes(String path, String formatName, String contentTypeName) throws IOException{
		File imagenFile = new File(path);
		ByteArrayOutputStream baos = new ByteArrayOutputStream(1000);
		BufferedImage img = null;

		try {
			img = ImageIO.read(imagenFile);
		}
		catch (IIOException e) {
			img = ImageIO.read(new File(this.defaultPath));
		}

		ImageIO.write(img, formatName, baos);
		baos.flush();

		String base64String = Base64.encode(baos.toByteArray());
		baos.close();

		byte[] bytearray = Base64.decode(base64String);
		return OutBuilder.response(contentTypeName, bytearray);
	}

	private String getEmptyImagePath(String type) {
		switch(type){
			case "user":
				return USER_IMG_PATH;
			case "place":
				return PLACE_IMG_PATH;
			default:
				return FOOD_MEETING_IMG_PATH;
		}
	}
}
