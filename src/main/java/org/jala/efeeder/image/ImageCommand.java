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
import javax.imageio.ImageIO;
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

    @Override
    public Out execute(In parameters) throws Exception {
        String imageName = parameters.getParameter("file_name");
        String path;
            String type = parameters.getParameter("type");
        if (imageName.equals("empty")) {
            path = parameters.getContext().getResource("/").getPath() + getEmptyImagePath(type);
        } else {
            path = parameters.getParameter("image_path") + "/" + imageName;
        }

        File fnew = new File(path);
        ByteArrayOutputStream baos = new ByteArrayOutputStream(1000);
        BufferedImage img = ImageIO.read(fnew);
        ImageIO.write(img, "jpg", baos);
        baos.flush();

        String base64String = Base64.encode(baos.toByteArray());
        baos.close();

        byte[] bytearray = Base64.decode(base64String);
        return OutBuilder.response("image/jpeg", bytearray);
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
