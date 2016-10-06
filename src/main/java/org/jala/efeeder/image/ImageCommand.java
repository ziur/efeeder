/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.image;

import com.sun.org.apache.xerces.internal.impl.dv.util.Base64;
import java.awt.image.BufferedImage;
import java.awt.image.RenderedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.nio.file.Files;
import java.sql.Connection;
import java.sql.PreparedStatement;
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

    @Override
    public Out execute(In parameters) throws Exception {
        String path = parameters.getParameter("image_path") + "/" + parameters.getUser().getImage();
        System.err.println("el path :" + path);
        
        File fnew = new File(path);
        ByteArrayOutputStream baos=new ByteArrayOutputStream(1000);
        BufferedImage img=ImageIO.read(fnew);
        ImageIO.write(img, "jpg", baos);
        baos.flush();

        String base64String=Base64.encode(baos.toByteArray());
        baos.close();

        byte[] bytearray = Base64.decode(base64String);
        return OutBuilder.response("image/jpeg", bytearray);
    }

}
