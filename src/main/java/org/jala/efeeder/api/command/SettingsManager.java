/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package org.jala.efeeder.api.command;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 *
 * @author alexander_castro
 */
public class SettingsManager {

    //settindsManager
    //resourceManager
    public static final String SETTINGS_FACTORY_KEY = "SETTINGS_FACTORY_KEY";

    private Map<String, Object> dataList = new HashMap<>();

    public void addData(Object key, Object data) {
        dataList.put(("" + key).toLowerCase(), data);
    }

    public Object getData(String key) {
        String commandName = key.toLowerCase();
        if (!dataList.containsKey(commandName)) {
            return null;
        }

        Object dataResult = dataList.get(commandName);
        return dataResult;
    }

    public void addAll(Set<Map.Entry<Object, Object>> entrySet) {
//        dataList = entrySet.stream().collect(Collectors.toMap(Entry::getKey, Entry::getValue));
        for (Map.Entry<Object, Object> entry : entrySet) {
            System.out.println("==>> entidad objeto ::" + entry.getKey() + " " + entry.getValue());
            dataList.put(("" + entry.getKey()).toLowerCase(), entry.getValue());
        }
    }
}
