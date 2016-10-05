/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.api.utils;

import java.io.File;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.SettingsManager;
import org.jala.efeeder.api.command.impl.DefaultIn;

/**
 *
 * @author alexander_castro
 */
public class ImageResourceManager {

    private static String DATA_KEY = "imgage_folder_path";
    private File diretorio;
    private final ServletContext context;

    public ImageResourceManager(ServletContext context) {
        this.context = context;
    }

    public In saveImage(HttpServletRequest request) {
        DefaultIn in = new DefaultIn();
        DiskFileItemFactory factory = new DiskFileItemFactory();
        factory.setRepository(diretorio);

        ServletFileUpload upload = new ServletFileUpload(factory);

        try {
            List<FileItem> items = upload.parseRequest(request);
            for (FileItem item : items) {
                if (!item.isFormField()) {
                    String path = processUploadedFile(item);
                    in.addParameter(item.getFieldName(), Arrays.asList(path));
                } else {
                    String nomeDoCampo = item.getFieldName();
                    String valorDoCampo = item.getString();
                    System.out.println(nomeDoCampo + ": " + valorDoCampo);
                    in.addParameter(nomeDoCampo, Arrays.asList(valorDoCampo));
                }
            }

        } catch (Exception e) {
            System.out.println("ERROR:" + e.getMessage());
            Logger.getLogger(ImageResourceManager.class.getName()).log(Level.SEVERE, null, e);
        }
        return in;
    }

    private String processUploadedFile(FileItem item) throws Exception {
        String webAppPath;
        webAppPath = getPathImgagesContainer();

        diretorio = new File(Paths.get(webAppPath, "assets", "img").toString());
        if (!diretorio.exists()) {
            diretorio.mkdirs();
        }
        String fileName = item.getName();
        File uploadedFile = new File(diretorio, fileName);
        item.write(uploadedFile);
        return uploadedFile.getPath();
    }

    private String getPathImgagesContainer() {
        SettingsManager settings
                = (SettingsManager) context.getAttribute(SettingsManager.SETTINGS_FACTORY_KEY);

        return "" + settings.getData(DATA_KEY);
    }
}
