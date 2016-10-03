/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.api.utils;

import java.io.File;
import java.nio.file.Paths;
import java.util.List;
import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.jala.efeeder.api.command.SettingsManager;

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

    public void saveImage(HttpServletRequest request) {
        DiskFileItemFactory factory = new DiskFileItemFactory();
        factory.setRepository(diretorio);

        ServletFileUpload upload = new ServletFileUpload(factory);

        try {
            List<FileItem> items = upload.parseRequest(request);
            for (FileItem item : items) {
                if (!item.isFormField()) {
                    processUploadedFile(item);
                } else {
                    String nomeDoCampo = item.getFieldName();
                    String valorDoCampo = item.getString();
                    System.out.println(nomeDoCampo + ": " + valorDoCampo);
                }
            }

        } catch (Exception e) {
            System.out.println("ERROR:" + e.getMessage());
            return;
        }
    }

    private void processUploadedFile(FileItem item) throws Exception {
        String webAppPath;
//        webAppPath = context.getRealPath("/");
        webAppPath = getPathImgagesContainer();

        System.out.println("The path obtains is of server is : " + webAppPath);

        diretorio = new File(Paths.get(webAppPath, "assets", "img").toString());
        if (!diretorio.exists()) {
            diretorio.mkdirs();
        }
        String fileName = item.getName();
        File uploadedFile = new File(diretorio, fileName);
        System.out.println("The path obtains of file to write is : " + uploadedFile.getPath());
        item.write(uploadedFile);
    }

    private String getPathImgagesContainer() {
        SettingsManager settings
                = (SettingsManager) context.getAttribute(SettingsManager.SETTINGS_FACTORY_KEY);

        return "" + settings.getData(DATA_KEY);
    }
}
