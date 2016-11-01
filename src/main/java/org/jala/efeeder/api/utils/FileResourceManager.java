package org.jala.efeeder.api.utils;

import java.io.File;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;
import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import org.apache.commons.fileupload.FileItem;
import org.apache.commons.fileupload.disk.DiskFileItemFactory;
import org.apache.commons.fileupload.servlet.ServletFileUpload;
import org.apache.log4j.Logger;
import org.jala.efeeder.api.command.In;
import org.jala.efeeder.api.command.SettingsManager;
import org.jala.efeeder.api.command.impl.DefaultIn;

/**
 *
 * @author alexander_castro
 */
public class FileResourceManager {
	
	final static Logger logger = Logger.getLogger(FileResourceManager.class);

	private static String DATA_KEY = "image_folder_path";
	private static String EMPTY = "empty";
	public static String ASSETS_FILE = "assets";
	public static String IMG_FILE = "img";
	private File diretorio;
	private final ServletContext context;
	private final String SAVE_IMAGE = "saveImage";
	private final String IMPORT_FILE = "importFile";

	public FileResourceManager(ServletContext context) {
		this.context = context;
	}

	public In process(HttpServletRequest request, String typeProcess) {
		DefaultIn in = new DefaultIn();
		DiskFileItemFactory factory = new DiskFileItemFactory();
		factory.setRepository(diretorio);

		ServletFileUpload upload = new ServletFileUpload(factory);

		try {
			List<FileItem> items = upload.parseRequest(request);
			for (FileItem item : items) {
				if (!item.isFormField()) {
					
					switch(typeProcess){
						case SAVE_IMAGE:
							String path = processUploadedFile(item, request.getSession().getId());
							in.addParameter(item.getFieldName(), Arrays.asList(path));
							break;
						case IMPORT_FILE:
							in.addParameter(ReadFileUtil.readCSVFile(item));
							break;
					};
				} else {
					String nameItem = item.getFieldName();
					String valueItem = item.getString();
					in.addParameter(nameItem, Arrays.asList(valueItem));
				}
			}

		} catch (Exception e) {
			logger.error("Error at the moment to proccess the file tu upload", e);
		}
		return in;
	}

	private String processUploadedFile(FileItem item, String token) throws Exception {
		String webAppPath;
		webAppPath = getPathImagesContainer();

		diretorio = new File(Paths.get(webAppPath, ASSETS_FILE, IMG_FILE).toString());
		if (!diretorio.exists()) {
			diretorio.mkdirs();
		}
		String fileName = item.getName();
		if (fileName.isEmpty()) {
			return EMPTY;
		}
		fileName = token + fileName;
		File uploadedFile = new File(diretorio, fileName);
		item.write(uploadedFile);
		return fileName;
	}

	private String getPathImagesContainer() {
		SettingsManager settings
				= (SettingsManager) context.getAttribute(SettingsManager.SETTINGS_FACTORY_KEY);

		return "" + settings.getData(DATA_KEY);
	}
}
