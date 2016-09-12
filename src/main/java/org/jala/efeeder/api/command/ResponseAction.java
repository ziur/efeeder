package org.jala.efeeder.api.command;

/**
 * Created by alejandro on 08-09-16.
 */
public class ResponseAction {
    private String url;
    private boolean isRedirect;

    public ResponseAction() {
        isRedirect = false;
    }

    public String getUrl() {
        return url;
    }

    public String getFordwarUrl() {
        return "/WEB-INF/" + url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public boolean isRedirect() {
        return isRedirect;
    }

    public void setRedirect(boolean redirect) {
        isRedirect = redirect;
    }

    @Override
    public String toString() {
        return "ResponseAction{" +
                "url='" + url + '\'' +
                ", isRedirect=" + isRedirect +
                '}';
    }
}
