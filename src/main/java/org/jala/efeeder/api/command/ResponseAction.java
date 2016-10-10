package org.jala.efeeder.api.command;

/**
 * Created by alejandro on 08-09-16.
 */
public class ResponseAction {
    public enum ResponseType {
        FORWARD, REDIRECT, MESSAGE, MESSAGE_BYTES
    }
    private ResponseType responseType;
    private String url;

    public ResponseAction() {
        responseType = ResponseType.FORWARD;
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

    public ResponseType getResponseType() {
        return responseType;
    }

    public void setResponseType(ResponseType responseType) {
        this.responseType = responseType;
    }

    @Override
    public String toString() {
        return "ResponseAction{" +
                       "responseType=" + responseType +
                       ", url='" + url + '\'' +
                       '}';
    }
}
