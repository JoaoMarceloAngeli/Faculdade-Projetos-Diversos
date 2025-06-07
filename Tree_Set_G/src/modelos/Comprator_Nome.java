/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package manipulacao;

import java.util.Comparator;
import modelos.Professor;

/**
 *
 * @author Cliente
 */
public class Comprator_Nome implements Comparator<Professor>{

    @Override
    public int compare(Professor o1, Professor o2) {
        return o1.getNome().compareToIgnoreCase(o2.getNome());
    }
    
}
