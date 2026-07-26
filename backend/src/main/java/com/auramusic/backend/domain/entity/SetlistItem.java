package com.auramusic.backend.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDateTime;

@Entity
@Table(name = "setlist_items", uniqueConstraints = @UniqueConstraint(name = "uq_setlist_items_position", columnNames = {"setlist_id", "position"}))
public class SetlistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "setlist_id", nullable = false)
    private Setlist setlist;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "song_id", nullable = false)
    private Song song;

    @Column(nullable = false)
    private Integer position;

    @Column(name = "transpose_steps", nullable = false)
    private Integer transposeSteps = 0;

    @Column(name = "break_seconds", nullable = false)
    private Integer breakSeconds = 0;

    @Column(length = 255)
    private String notes;

    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Setlist getSetlist() { return setlist; }
    public void setSetlist(Setlist setlist) { this.setlist = setlist; }
    public Song getSong() { return song; }
    public void setSong(Song song) { this.song = song; }
    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }
    public Integer getTransposeSteps() { return transposeSteps; }
    public void setTransposeSteps(Integer transposeSteps) { this.transposeSteps = transposeSteps; }
    public Integer getBreakSeconds() { return breakSeconds; }
    public void setBreakSeconds(Integer breakSeconds) { this.breakSeconds = breakSeconds; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
